import * as path from "path";
import * as fs from "fs-extra";
import chalk from "chalk";
import { Command } from "commander";
import {
  capitalizeFirstLetter,
  recursiveFindByExtension,
  convertJsonToTs,
  generateFolderFlatMap,
  isCountryLanguageCode,
  listFolderNames,
  logError,
  readContentsFile,
  IContentsEntry,
  logOutput,
} from "../../utils";
import { spawnSync } from "child_process";

import { getActiveDeployment } from "../deployment/get";
import { ROOT_DIR } from "../../paths";

const ASSETS_GLOBAL_FOLDER_NAME = "global";

/***************************************************************************************
 * CLI
 * @example yarn
 *************************************************************************************/
interface IProgramOptions {
  localSheets: string;
  localAssets: string;
  appSheets: string;
  appAssets: string;
  skipSheets?: boolean;
  skipAssets?: boolean;
}
const program = new Command("copy");
export default program
  .description("Copy app data")
  .option("--local-sheets <string>", "path to local sheets folder")
  .option("--local-assets <string>", "path to local assets folder")
  .option("--app-sheets <string>", "path to app sheets folder")
  .option("--app-assets <string>", "path to app sheets folder")
  .option("--skip-sheets")
  .option("--skip-assets")
  .action(async (options: IProgramOptions) => {
    console.table(options);
    new AppDataCopy(options).run();
  });

/***************************************************************************************
 * Main Methods
 *************************************************************************************/
/**
 *
 **/
class AppDataCopy {
  private paths = {
    LOCAL_SHEETS_FOLDER: "",
    LOCAL_ASSETS_FOLDER: "",
    APP_SHEETS_FOLDER: "",
    APP_ASSETS_FOLDER: "",
  };
  private activeDeployment = getActiveDeployment();
  constructor(private options: IProgramOptions) {
    const { appAssets, appSheets, localAssets, localSheets } = options;
    const { app_data, translations, _workspace_path } = this.activeDeployment;
    this.paths = {
      LOCAL_SHEETS_FOLDER: localSheets || translations.output_cache_path,
      LOCAL_ASSETS_FOLDER: localAssets || path.resolve(_workspace_path, "app_data", "assets"),
      APP_SHEETS_FOLDER: appSheets || app_data.sheets_output_path,
      APP_ASSETS_FOLDER: appAssets || app_data.assets_output_path,
    };
  }

  public run() {
    const { APP_SHEETS_FOLDER, LOCAL_ASSETS_FOLDER, APP_ASSETS_FOLDER, LOCAL_SHEETS_FOLDER } =
      this.paths;

    // Sheets
    if (!this.options.skipSheets) {
      console.log(chalk.yellow("Copy Sheets"));
      writeAppTsFiles(path.resolve(LOCAL_SHEETS_FOLDER, "jsons"), APP_SHEETS_FOLDER);
      this.generateAppDataIndexFiles();
      this.writeTranslationTsFiles(
        path.resolve(LOCAL_SHEETS_FOLDER, "strings"),
        path.resolve(APP_SHEETS_FOLDER, "translation_strings")
      );
      runPrettierCodeTidy(APP_SHEETS_FOLDER);
    }

    // Assets
    if (!this.options.skipAssets) {
      console.log(chalk.yellow("Copy Assets"));
      assetsQualityCheck(LOCAL_ASSETS_FOLDER);
      this.copyAppAssetFiles(LOCAL_ASSETS_FOLDER, APP_ASSETS_FOLDER);
      this.generateDataAssetsIndexFile();
      runPrettierCodeTidy(APP_ASSETS_FOLDER);
    }

    console.log(chalk.green("Copy Complete"));
  }

  private writeTranslationTsFiles(sourceFolder: string, targetFolder: string) {
    fs.ensureDirSync(targetFolder);
    fs.emptyDirSync(targetFolder);
    fs.removeSync(
      path.resolve(this.paths.APP_SHEETS_FOLDER, "translation_strings", "_combined.json")
    );
    // convert all individual strings to ts, but ignore combined
    const sourceFiles = recursiveFindByExtension(sourceFolder, "json").filter(
      (filepath) => path.basename(filepath) !== "_combined.json"
    );
    convertJsonToTs(sourceFiles, {
      outputDir: targetFolder,
      defaultExportType: "{[source_text:string]:string}",
      indexFile: {
        namedExport: "TRANSLATION_STRINGS",
      },
    });
  }

  /**
   * Create an index recursively listing all assets in app-data assets folder.
   * Distinguishies between 'global' and 'translated' assets via folder naming, and tracks which global files have
   * corresponding translation files
   * */
  private generateDataAssetsIndexFile(assetsBase = this.paths.APP_ASSETS_FOLDER) {
    const topLevelFolders = listFolderNames(assetsBase);
    const languageFolders = topLevelFolders.filter((name) => isCountryLanguageCode(name));

    // TODO - ideally "global" folder should sit at top level but refactoring required so for now use filter
    const globalAssetsFolder = path.join(assetsBase, ASSETS_GLOBAL_FOLDER_NAME);
    const globalAssets = generateFolderFlatMap(globalAssetsFolder, true) as {
      [relative_path: string]: IAssetEntry;
    };
    const untrackedAssets: any = [];

    // populate tracked and untracked translated assets
    for (const languageFolder of languageFolders) {
      const languageFolderPath = path.resolve(assetsBase, languageFolder);
      const translatedAssets = generateFolderFlatMap(languageFolderPath);
      Object.entries(translatedAssets).forEach(([name, value]) => {
        if (globalAssets.hasOwnProperty(name)) {
          globalAssets[name].translations = globalAssets[name].translations || {};
          globalAssets[name].translations[languageFolder] = value as IContentsEntry;
        } else {
          untrackedAssets.push(`${languageFolder}/${name}`);
        }
      });
    }
    // clean output to exclude modifiedTime and relativePath fields. Track totals
    // TODO - size calcs could be tidied to own function
    const cleanedContents: { [relative_path: string]: Partial<IAssetEntry> } = {};
    let sizeTotals = { global: 0 };
    Object.entries(globalAssets).forEach(([key, entry]) => {
      const { modifiedTime, relativePath, ...fieldsToKeep } = entry;
      cleanedContents[key] = fieldsToKeep;
      sizeTotals.global += Math.round(entry.size_kb / 102.4) / 10;
      // repeat for nested translation entries (TODO - could give breakdown by language)
      if (entry.translations) {
        Object.entries(entry.translations).forEach(([translated_key, translatedEntry]) => {
          const { modifiedTime, relativePath, ...translatedFieldsToKeep } = translatedEntry;
          cleanedContents[key].translations[translated_key] = translatedFieldsToKeep as any;
          if (!sizeTotals[translated_key]) sizeTotals[translated_key] = 0;
          sizeTotals[translated_key] += Math.round(translatedEntry.size_kb / 102.4) / 10;
        });
      }
    });

    // write output index file for tracked and untracked assets
    const outputTS = `export const UNTRACKED_ASSETS = ${JSON.stringify(untrackedAssets, null, 2)}
  \r\nexport const ASSETS_CONTENTS_LIST = ${JSON.stringify(cleanedContents, null, 2)}`;
    const APP_DATA_ASSETS_INDEX_PATH = path.resolve(this.paths.APP_ASSETS_FOLDER, "index.ts");
    fs.writeFileSync(APP_DATA_ASSETS_INDEX_PATH, outputTS);

    // Log total size of all exports
    let assetsTotal = 0;
    Object.keys(sizeTotals).forEach((key) => {
      sizeTotals[key] = Math.round(sizeTotals[key] * 10) / 10;
      assetsTotal += sizeTotals[key];
    });
    const totalsByLang = JSON.stringify(sizeTotals, null, 2)
      .replace(/[{}]/gim, "")
      .replace(/[ ]{2}/gim, "")
      .replace(/"/gim, "");
    logOutput({
      msg1: "Assets copied",
      msg2: `Total size: ${Math.round(assetsTotal * 10) / 10} MB\n\n${totalsByLang}`,
    });
  }

  /**
   * Create a default index.ts file in each data folder to export all other local
   * data files (and produce a singular import)
   */
  private generateAppDataIndexFiles() {
    const dataDirs = fs.readdirSync(this.paths.APP_SHEETS_FOLDER);
    for (const folderName of dataDirs) {
      const dirPath = path.resolve(this.paths.APP_SHEETS_FOLDER, folderName);
      const dataFiles = fs.readdirSync(dirPath);
      const importStatements = [];
      const exportStatements = [];
      dataFiles.forEach((filePath, i) => {
        const importPath = path.basename(filePath, ".ts");
        let importName = importPath.replace(".", "_");
        if (importName === folderName) {
          importName += `_${i}`;
        }
        importStatements.push(`import ${importName} from "./${importPath}"`);
        exportStatements.push(importName);
      });
      const indexFilePath = `${dirPath}/index.ts`;
      fs.createFileSync(indexFilePath);
      fs.appendFileSync(indexFilePath, `import { FlowTypes } from "data-models";\r\n`);
      fs.appendFileSync(indexFilePath, `${importStatements.join("\r\n")};\r\n`);
      fs.appendFileSync(
        indexFilePath,
        `export const ${folderName}:FlowTypes.${capitalizeFirstLetter(
          folderName
        )}[] = [].concat(${exportStatements.join(",")})`
      );
    }
  }

  private copyAppAssetFiles(sourceFolder: string, targetFolder: string) {
    // setup folders
    fs.ensureDirSync(targetFolder);
    fs.emptyDirSync(targetFolder);
    // filter and copy
    const assetFiles = readContentsFile(sourceFolder);
    const { assets_filter_function } = this.activeDeployment.app_data;
    const filterLanguages = this.activeDeployment.translations?.filter_language_codes;

    if (filterLanguages) {
      filterLanguages.push("global");
    }
    const filteredFiles = assetFiles.filter((fileEntry) => {
      // language filter
      if (filterLanguages) {
        const [lang_folder] = fileEntry.relativePath.split("/");
        if (!filterLanguages.includes(lang_folder)) return false;
      }
      // global filter
      return assets_filter_function(fileEntry);
    });

    for (const fileEntry of filteredFiles) {
      const src = path.resolve(sourceFolder, fileEntry.relativePath);
      const dest = path.resolve(targetFolder, fileEntry.relativePath);
      fs.ensureDir(path.dirname(dest));
      fs.copySync(src, dest, { preserveTimestamps: true });
    }
  }
}

/** Ensure asset folders are named correctly */
function assetsQualityCheck(sourceFolder: string) {
  const output = { hasGlobalFolder: false, languageFolders: [], invalidFolders: [] };
  const topLevelFolders = listFolderNames(sourceFolder);
  for (const folderName of topLevelFolders) {
    if (folderName === ASSETS_GLOBAL_FOLDER_NAME) output.hasGlobalFolder = true;
    else {
      if (isCountryLanguageCode(folderName)) output.languageFolders.push(folderName);
      else output.invalidFolders.push(folderName);
    }
  }
  if (!output.hasGlobalFolder) {
    logError({
      msg1: "Assets global folder not found",
      msg2: `Assets folder should include a folder named "${ASSETS_GLOBAL_FOLDER_NAME}"`,
    });
  }
  if (output.invalidFolders.length > 0) {
    logError({
      msg1: "Asset folders named incorrectly",
      msg2: `Invalid language codes: [${output.invalidFolders.join(", ")}]`,
    });
  }
}

function writeAppTsFiles(sourceFolder: string, targetFolder: string) {
  fs.ensureDirSync(sourceFolder);
  fs.ensureDirSync(targetFolder);
  fs.emptyDirSync(targetFolder);
  const localTsFiles = recursiveFindByExtension(sourceFolder, "json");
  for (const filepath of localTsFiles) {
    const fileJson = fs.readJSONSync(filepath);
    // files are organised by flow_type, so get name of parent folder for type
    const flow_type = path.dirname(filepath).split(path.sep).pop();
    // create output ts from json
    const appOutputTs = generateLocalTsOutput(fileJson, flow_type);
    const outputPath = path.join(targetFolder, path.relative(sourceFolder, filepath));
    const outputDir = path.dirname(outputPath);
    const outputName = path.basename(filepath).replace(".json", ".ts");
    // write outputs
    fs.ensureDirSync(outputDir);
    fs.writeFileSync(path.resolve(outputDir, outputName), appOutputTs);
  }
}

/**
 * Create a ts file of json export, importing what would be the relevant local
 * typings to allow checking against data (and disabling unwanted additional linting)
 *
 * When copying to the app simply replace the path to local typings imported to
 * the path imported from within the app
 */
function generateLocalTsOutput(json: any, flow_type: string) {
  const typeName = capitalizeFirstLetter(flow_type);
  return `/* eslint-disable */
  import { FlowTypes } from "data-models"
  const ${flow_type}: FlowTypes.${typeName}[] = ${JSON.stringify(json, null, 2)};
  export default ${flow_type}
  `;
}

/**
 * Run prettier to automatically format code in given folder path
 * NOTE - by default will only format .ts files
 */
function runPrettierCodeTidy(folderPath: string) {
  const cmd = `npx prettier --config ${ROOT_DIR}/.prettierrc --write ${folderPath}/**/*.ts --loglevel error`;
  return spawnSync(cmd, { stdio: ["inherit", "inherit", "inherit"], shell: true });
}

/**  Subset of IContentsEntry (with additional translations) */
interface IAssetEntry extends IContentsEntry {
  translations?: { [language_code: string]: IContentsEntry };
}
