import ModerationScreen from "@/components/webhub/screens/ModerationScreen";
import ModerationV2 from "@/components/webhub/v2/screens/ModerationV2";
import { Designed } from "@/components/webhub/design/DesignProvider";

export default function Page() {
    return <Designed v1={ModerationScreen} v2={ModerationV2}/>;
}
