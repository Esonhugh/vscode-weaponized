import { MarkdownHTTPCodeLensProvider } from "./base";
import { httpRepeaterCodeLens } from "./send";

export const httpRepeater = new MarkdownHTTPCodeLensProvider(httpRepeaterCodeLens);