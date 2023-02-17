import { FlowTypes } from "data-models";
type ISheetContents = {
  [flow_type in FlowTypes.FlowType]: { [flow_name: string]: FlowTypes.FlowTypeBase };
};
export const SHEETS_CONTENT_LIST: ISheetContents = {
  data_list: {
    bathing: {
      flow_type: "data_list",
      flow_name: "bathing",
      data_list_name: "bathing",
      _xlsxPath: "data_lists/homepage/module_details.xlsx",
    },
    clean_toilets: {
      flow_type: "data_list",
      flow_name: "clean_toilets",
      data_list_name: "clean_toilets",
      _xlsxPath: "data_lists/homepage/module_details.xlsx",
    },
    debug_nav_list: {
      flow_type: "data_list",
      flow_name: "debug_nav_list",
      flow_subtype: "debug",
      _xlsxPath: "quality_assurance/debug_sheets/debug_nav.xlsx",
    },
    bathing_tasks: {
      flow_name: "bathing_tasks",
      flow_subtype: "generated",
      flow_type: "data_list",
    },
    clean_toilets_tasks: {
      flow_name: "clean_toilets_tasks",
      flow_subtype: "generated",
      flow_type: "data_list",
    },
    handwashing_with_soap_tasks: {
      flow_name: "handwashing_with_soap_tasks",
      flow_subtype: "generated",
      flow_type: "data_list",
    },
    healthy_families_tasks: {
      flow_name: "healthy_families_tasks",
      flow_subtype: "generated",
      flow_type: "data_list",
    },
    healthy_homes_tasks: {
      flow_name: "healthy_homes_tasks",
      flow_subtype: "generated",
      flow_type: "data_list",
    },
    how_to_wash_your_hands_tasks: {
      flow_name: "how_to_wash_your_hands_tasks",
      flow_subtype: "generated",
      flow_type: "data_list",
    },
    module_tasks: {
      flow_name: "module_tasks",
      flow_subtype: "generated",
      flow_type: "data_list",
    },
    safe_drinking_water_tasks: {
      flow_name: "safe_drinking_water_tasks",
      flow_subtype: "generated",
      flow_type: "data_list",
    },
    safe_food_tasks: {
      flow_name: "safe_food_tasks",
      flow_subtype: "generated",
      flow_type: "data_list",
    },
    waste_tasks: {
      flow_name: "waste_tasks",
      flow_subtype: "generated",
      flow_type: "data_list",
    },
    when_to_wash_your_hands_tasks: {
      flow_name: "when_to_wash_your_hands_tasks",
      flow_subtype: "generated",
      flow_type: "data_list",
    },
    handwashing_with_soap: {
      flow_type: "data_list",
      flow_name: "handwashing_with_soap",
      data_list_name: "handwashing_with_soap",
      _xlsxPath: "data_lists/homepage/module_details.xlsx",
    },
    healthy_families: {
      flow_type: "data_list",
      flow_name: "healthy_families",
      data_list_name: "healthy_families",
      _xlsxPath: "data_lists/homepage/module_details.xlsx",
    },
    healthy_homes: {
      flow_type: "data_list",
      flow_name: "healthy_homes",
      data_list_name: "healthy_homes",
      _xlsxPath: "data_lists/homepage/module_details.xlsx",
    },
    how_to_wash_your_hands: {
      flow_type: "data_list",
      flow_name: "how_to_wash_your_hands",
      data_list_name: "how_to_wash_your_hands",
      _xlsxPath: "data_lists/homepage/module_details.xlsx",
    },
    module: {
      flow_type: "data_list",
      flow_name: "module",
      data_list_name: "module",
      _xlsxPath: "data_lists/homepage/module_tasks.xlsx",
    },
    safe_drinking_water: {
      flow_type: "data_list",
      flow_name: "safe_drinking_water",
      data_list_name: "safe_drinking_water",
      _xlsxPath: "data_lists/homepage/module_details.xlsx",
    },
    safe_food: {
      flow_type: "data_list",
      flow_name: "safe_food",
      data_list_name: "safe_food",
      _xlsxPath: "data_lists/homepage/module_details.xlsx",
    },
    waste: {
      flow_type: "data_list",
      flow_name: "waste",
      data_list_name: "waste",
      _xlsxPath: "data_lists/homepage/module_details.xlsx",
    },
    when_to_wash_your_hands: {
      flow_type: "data_list",
      flow_name: "when_to_wash_your_hands",
      data_list_name: "when_to_wash_your_hands",
      _xlsxPath: "data_lists/homepage/module_details.xlsx",
    },
  },
  global: {},
  template: {
    app_menu: {
      flow_type: "template",
      flow_name: "app_menu",
      _xlsxPath: "templates/global/navigation_modular.xlsx",
    },
    debug_nav: {
      flow_type: "template",
      flow_name: "debug_nav",
      flow_subtype: "debug",
      _xlsxPath: "quality_assurance/debug_sheets/debug_nav.xlsx",
    },
    debug_nav_2: {
      flow_type: "template",
      flow_name: "debug_nav_2",
      flow_subtype: "debug",
      _xlsxPath: "quality_assurance/debug_sheets/debug_nav.xlsx",
    },
    home_screen: {
      flow_type: "template",
      flow_name: "home_screen",
      _xlsxPath: "templates/global/navigation_modular.xlsx",
    },
    module_card: {
      flow_type: "template",
      flow_name: "module_card",
      _xlsxPath: "templates/global/navigation_modular.xlsx",
    },
    module_overview: {
      flow_type: "template",
      flow_name: "module_overview",
      _xlsxPath: "templates/global/navigation_modular.xlsx",
    },
    module_tool: {
      flow_type: "template",
      flow_name: "module_tool",
      _xlsxPath: "templates/global/navigation_modular.xlsx",
    },
    reference_popup: {
      flow_type: "template",
      flow_name: "reference_popup",
      _xlsxPath: "templates/global/navigation_modular.xlsx",
    },
  },
  tour: {},
  data_pipe: {
    module_task_completion: {
      flow_type: "data_pipe",
      flow_name: "module_task_completion",
      _xlsxPath: "data_lists/homepage/module_tasks.xlsx",
    },
  },
};
