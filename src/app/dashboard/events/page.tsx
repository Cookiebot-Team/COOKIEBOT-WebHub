import EventsScreen from "@/components/webhub/screens/EventsScreen";
import EventsV2 from "@/components/webhub/v2/screens/EventsV2";
import { Designed } from "@/components/webhub/design/DesignProvider";

export default function Page() {
    return <Designed v1={EventsScreen} v2={EventsV2}/>;
}
