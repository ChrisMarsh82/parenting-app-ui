import { cloneConfig } from "data-models/deployment.model";
import DEFAULT_CONFIG from "./global.config";
import { SKINS } from "./skins";

/** Debug config extends the default config **/

const config = cloneConfig(DEFAULT_CONFIG);
config.name = "plh_debug";

// Override constants
config.app_config!.APP_SKINS!.defaultSkinName = SKINS.debug.name;
// Limit available skins to only include debug skin, to force this skin to be applied on init
config.app_config!.APP_SKINS!.available = [SKINS.debug];

export default config;
