import PostsScreen from "@/components/webhub/screens/PostsScreen";
import PostsV2 from "@/components/webhub/v2/screens/PostsV2";
import { Designed } from "@/components/webhub/design/DesignProvider";

export default function Page() {
    return <Designed v1={PostsScreen} v2={PostsV2}/>;
}
