//react
import { useEffect, useRef, useState } from "react";

//#region prime react
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import type { InputNumberValueChangeEvent } from "primereact/inputnumber";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Accordion } from "primereact/accordion";
import { AccordionTab } from "primereact/accordion";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
//#endregion prime react

//saját importok
import { GetVersenyzo, Add_versenyzo } from "../api/versenyzok";

import { getTeamSummary } from "../api/teams";
import type { TeamSummary } from "../types/teams";
import type { Member } from "../types/members";
import type { Lap } from "../types/lap";
import { secondsToHHMMSS } from "../Clock/idovalto";
import { useIsMobile } from "../hooks/useIsMobile";

export default function Versenyzok() {
  const isMobile = useIsMobile();

  const [neve, setneve] = useState<string>("");
  const [rajt, setrajt] = useState<number>(0);
  const [kiv_csapat, setkiv_csapat] = useState<TeamSummary | null>(null);

  //Listák
  const [versenyzok, setVersenyzok] = useState<Member[]>([]);
  const [csapatok, setcsapatok] = useState<TeamSummary[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const toast = useRef<Toast>(null);
  //Datatable
  const [expandedRows, setExpandedRows] = useState<any>(null);

  const Sikeres_save = () => {
    toast.current?.show({
      severity: "success",
      summary: "Siker",
      detail: "Sikeres mentés",
      life: 4000,
    });
  };

  const Sikertelen_save = () => {
    toast.current?.show({
      severity: "error",
      summary: "mentés Sikertelen",
      detail: "Nincs megfelelően kitöltve az összes mező",
      life: 4000,
    });
  };

  const GetRacers = async () => {
    setLoading(true);
    try {
      const data = await GetVersenyzo();
      const csapat = await getTeamSummary();
      setcsapatok(csapat);
      setVersenyzok(data);
    } catch (err) {
      console.error("Csapatok betöltése sikertelen", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log("majd mentés lesz itt :D ");
    if (!kiv_csapat) {
      console.error("Nincs kiválasztott csapat");
      return;
    }
    try {
      await Add_versenyzo(neve, rajt, kiv_csapat.id);
      setneve("");
      setrajt(0);
      setkiv_csapat(null);
      await GetRacers();
      Sikeres_save();
    } catch (err) {
      console.error("Csapat mentése sikertelen", err);
      Sikertelen_save();
    }
  };

  useEffect(() => {
    GetRacers();
  }, []);

  const racer_expanded = (member: Member) => (
    <div style={{ padding: "0.75rem 1.5rem" }}>
      <DataTable value={member.laps} size="small">
        <Column field="lap_no" header="Körök" />
        <Column header="Idő" body={(l: Lap) => secondsToHHMMSS(l.time_ms)} />
      </DataTable>
    </div>
  );

  return (
    <>
      <div className="mt-5 border-round">
        {isMobile ? (
          <>
            <Toast ref={toast} position="top-center" />

            <form
              className="flex flex-column align-items-center gap-4 pt-3 pb-5"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <FloatLabel>
                <InputText
                  id="racer"
                  value={neve}
                  onChange={(e) => setneve(e.target.value)}
                />
                <label htmlFor="racer">Versenyző neve</label>
              </FloatLabel>
              <FloatLabel>
                <InputNumber
                  id="race_num"
                  value={rajt}
                  onValueChange={(e: InputNumberValueChangeEvent) =>
                    setrajt(e.value ?? 0)
                  }
                  useGrouping={false}
                />
                <label htmlFor="race_num">Rajtszám</label>
              </FloatLabel>
              <div className="flex flex-inline gap-4">
                <p>Csapatok</p>
                <Dropdown
                  value={kiv_csapat}
                  options={csapatok}
                  optionLabel="name"
                  onChange={(e) => {
                    setkiv_csapat(e.value);
                    console.log(e.value);
                  }}
                ></Dropdown>
              </div>
              <Button
                type="submit"
                label="Hozzáad"
                className="w-5"
                onClick={(e) => {
                  handleSave();
                }}
              />
            </form>
            <Accordion multiple>
              {versenyzok.map((racer) => (
                <AccordionTab key={racer.id} header={`${racer.name}`}>
                  <p>
                    Rajt szám:{" "}
                    <span className="font-bold text-xl">{racer.rajt_szam}</span>
                  </p>
                  {racer.laps.length > 0 ? (
                    racer.laps.map((korok) => (
                      <>
                        <div key={korok.id}>
                          {korok.lap_no}. kör: {secondsToHHMMSS(korok.time_ms)}
                        </div>
                      </>
                    ))
                  ) : (
                    <>
                      <p>Még nincs mért kör</p>
                    </>
                  )}
                </AccordionTab>
              ))}
            </Accordion>
          </>
        ) : (
          <>
            <Toast ref={toast} />
            <form
              className="flex flex-column align-items-center gap-4 pt-3"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <FloatLabel>
                <InputText
                  id="racer"
                  value={neve}
                  onChange={(e) => setneve(e.target.value)}
                />
                <label htmlFor="racer">Versenyző neve</label>
              </FloatLabel>
              <FloatLabel>
                <InputNumber
                  id="race_num"
                  value={rajt}
                  onValueChange={(e: InputNumberValueChangeEvent) =>
                    setrajt(e.value ?? 0)
                  }
                  useGrouping={false}
                />
                <label htmlFor="race_num">Rajtszám</label>
              </FloatLabel>

              <div className="flex flex-inline gap-4">
                <p>Csapatok</p>
                <Dropdown
                  value={kiv_csapat}
                  options={csapatok}
                  optionLabel="name"
                  onChange={(e) => {
                    setkiv_csapat(e.value);
                    console.log(e.value);
                  }}
                ></Dropdown>
              </div>

              <Button
                type="submit"
                label="Hozzáad"
                className="w-2"
                onClick={(e) => {
                  handleSave();
                }}
              />
            </form>
            <DataTable
              value={versenyzok}
              dataKey="id"
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              rowExpansionTemplate={racer_expanded}
            >
              <Column expander style={{ width: "3rem" }}></Column>
              <Column field="name" header="Név"></Column>
              <Column field="rajt_szam" header="Rajtszám"></Column>
            </DataTable>
          </>
        )}
      </div>
    </>
  );
}
