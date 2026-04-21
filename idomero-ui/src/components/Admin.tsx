import { useIsMobile } from "../hooks/useIsMobile";

export default function Admin() {
  const isMobile = useIsMobile();
  return (
    <>
      <h1 className={isMobile ? "px-3" : ""}>
        admin site itt lesz minden adat kezelve
      </h1>
    </>
  );
}
