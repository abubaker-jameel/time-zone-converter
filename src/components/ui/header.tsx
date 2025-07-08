import type { FC } from "react";
import TimezoneComparer from "./TimezoneComparer";
const Header: FC = () => {
    return (
        <div className="p-4 w-[400px] h-[600px] border border-solid border-black">
            <TimezoneComparer />
        </div>
    );
}

export default Header