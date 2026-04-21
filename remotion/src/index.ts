/**
 * Remotion entry — registers compositions with the Remotion Studio CLI.
 * Run: npm run remotion:dev
 */

import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
