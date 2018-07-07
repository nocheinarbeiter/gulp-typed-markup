import {getCssRules} from './css-rules-extractor';
import {getClassEntries} from './class-entries-extractor';
import {getBemEntries} from './bem-entries-extractor';
import {generateModuleSource} from './module-source-generator';


export async function getModuleSource(moduleName: string, cssSource: Buffer) {
    var cssRules = await getCssRules(cssSource);
    var classEntries = getClassEntries(cssRules);
    var bemEntries = getBemEntries(classEntries);
    var moduleSource = generateModuleSource(moduleName, bemEntries);
    return moduleSource;
}
