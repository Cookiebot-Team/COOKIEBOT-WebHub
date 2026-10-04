import GeneralScreen from "@/components/webhub/screens/GeneralScreen";
import GeneralV2 from "@/components/webhub/v2/screens/GeneralV2";
import { Designed } from "@/components/webhub/design/DesignProvider";

export default function Page() {
    return <Designed v1={GeneralScreen} v2={GeneralV2}/>;
}
