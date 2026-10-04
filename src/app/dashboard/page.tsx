import SetUpScreen from "@/components/webhub/screens/SetUpScreen";
import HomeV2 from "@/components/webhub/v2/screens/HomeV2";
import { Designed } from "@/components/webhub/design/DesignProvider";

export default function Page() {
    return <Designed v1={SetUpScreen} v2={HomeV2}/>;
}
