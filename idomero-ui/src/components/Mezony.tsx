import React, { useEffect, useRef, useState } from "react";
import Csapatok from "./Csapatok";
import Versenyzok from "./Versenyzok";
import { TabView, TabPanel } from "primereact/tabview";

export default function Mezony() {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

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
