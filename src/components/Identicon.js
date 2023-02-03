import { useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Jazzicon from "@metamask/jazzicon";

const useStyles = makeStyles(() => ({
  icon: {
    height: "1rem",
    width: "1rem",
    borderRadius: "1.125rem",
    borderColor: "black",
  },
}));

export default function Identicon({ account, size = 16 }) {
  const classes = useStyles();
  const ref = useRef();

  useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(
        Jazzicon(size, parseInt(account.slice(2, 10), 16))
      );
    }
  }, [account, size]);

  return <div className={classes.icon} ref={ref} />;
}
