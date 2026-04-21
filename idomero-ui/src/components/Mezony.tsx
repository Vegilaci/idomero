import Csapatok from "./Csapatok";
import Versenyzok from "./Versenyzok";
import { TabView, TabPanel } from "primereact/tabview";
import { useIsMobile } from "../hooks/useIsMobile";

export default function Mezony() {
  const isMobile = useIsMobile();

  function padding_vagy_se() {
    if (isMobile) {
      return "";
    } else {
      return "p-5";
    }
  }

  return (
    <>
      <div className={padding_vagy_se()}>
        <TabView>
          <TabPanel header="Csapatok">
            <Csapatok />
          </TabPanel>
          <TabPanel header="Versenyzők">
            <Versenyzok />
          </TabPanel>
        </TabView>
      </div>
    </>
  );
}
