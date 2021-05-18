import { FlowTypes } from "../../../../types";
import { extractDynamicFields } from "../../../utils";
import { DefaultParser } from "../default/default.parser";
import { flattenJson, parsePLHCollectionString, parsePLHListString } from "../../utils";

export class TemplateParser extends DefaultParser {
  constructor() {
    super();
    this.groupSuffix = "";
  }
  postProcess(row: FlowTypes.TemplateRow, nestedPath?: string) {
    // remove empty rows
    if (Object.keys(row).length === 0) {
      return;
    }
    // set all empty row and nested row types to 'set_variable' type
    if (!row.type) {
      row.type = "set_variable";
    }
    // TODO - confirm if handling the same and then remove from excel sheets
    if (row.type === ("template_group" as any)) {
      row.type = "template";
    }
    // when unique name not specified assume namespacing with template value (flow_name)
    // or the row type for non-templates
    if (!row.name) {
      if (row.type === "template") {
        row.name = row.value;
      } else {
        row.name = row.type;
      }
    }
    // track path to row when nested
    row._nested_name = nestedPath ? `${nestedPath}.${row.name}` : row.name;

    // convert any variables (local/global) list or collection strings (e.g. 'my_list_1')
    if (row.value && typeof row.value === "string") {
      if (row.name?.includes("_list") && row.value && typeof row.value === "string") {
        row.value = parsePLHListString(row.value);
      }
      if (row.name?.includes("_collection") && row.value && typeof row.value === "string") {
        row.value = parsePLHCollectionString(row.value);
      }
    }
    if (row.parameter_list) {
      row.parameter_list = this.parseParameterList(row.parameter_list as any);
    }
    // extract dynamic fields for runtime evaluation
    const dynamicFields = extractDynamicFields(row);
    if (dynamicFields) {
      row._dynamicFields = dynamicFields;
      row._dynamicDependencies = this.extractDynamicDependencies(dynamicFields);
    }

    // handle nested rows in same way
    if (row.rows) {
      row.rows = row.rows.map((r) => this.postProcess(r, row._nested_name));
    }
    return row;
  }

  private parseParameterList(parameterList: string[]) {
    const parameterObj: FlowTypes.TemplateRow["parameter_list"] = {};
    parameterList.forEach((p) => {
      let [key, value] = p.split(":").map((str) => str.trim()) as any[];
      // if a single word is specified, e.g. 'box_display', assume setting param to true
      if (value === undefined) {
        value = "true";
      }
      parameterObj[key] = value;
    });
    return parameterObj;
  }

  private extractDynamicDependencies(dynamicFields: FlowTypes.TemplateRow["_dynamicFields"]) {
    const dynamicDependencies = {};
    const flatFields = flattenJson<FlowTypes.TemplateRowDynamicEvaluator[]>(dynamicFields);
    Object.entries(flatFields).forEach(([key, fields]) => {
      fields.forEach((field) => {
        const deps = dynamicDependencies[field.matchedExpression] || [];
        dynamicDependencies[field.matchedExpression] = [...deps, key];
      });
    });
    return dynamicDependencies;
  }
}
