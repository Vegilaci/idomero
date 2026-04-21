import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Accordion } from "primereact/accordion";
import { AccordionTab } from "primereact/accordion";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { getTeams, createTeam } from "../api/teams";
import type { TeamDetail } from "../types/teams";
import type { Member } from "../types/members";
import { secondsToHHMMSS } from "../Clock/idovalto";
import { useIsMobile } from "../hooks/useIsMobile";

export default function Csapatok() {
  const [value, setValue] = useState<string>("");
  const [csapatok, setCsapatok] = useState<TeamDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedRows, setExpandedRows] = useState<any>(null);
  const isMobile = useIsMobile();

  const reloadTeams = async () => {
    setLoading(true);
    try {
      const data = await getTeams();
      setCsapatok(data);
    } catch (err) {
      console.error("Csapatok betöltése sikertelen", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadTeams();
  }, []);

  const handleSaveTeam = async () => {
    if (!value.trim()) return;

    try {
      await createTeam(value.trim());
      setValue("");
      // opcionális: lista frissítés
      await reloadTeams();
    } catch (err) {
      console.error("Csapat mentése sikertelen", err);
    }
  };

  const teamExpansionTemplate = (team: TeamDetail) => (
    <div style={{ padding: "1rem" }}>
      <h4>{team.name} – versenyzők</h4>

      <DataTable value={team.members} size="small">
        <Column field="rajt_szam" header="Rajt #" />
        <Column field="name" header="Név" />
        <Column header="Körök" body={(m: Member) => m.laps.length} />
        <Column
          header="Összidő"
          body={(m: Member) =>
            secondsToHHMMSS(m.laps.reduce((sum, l) => sum + l.time_ms, 0))
          }
        />
      </DataTable>
    </div>
  );

  return (
    <>
      <div className="card flex justify-content-center gap-3">
        <FloatLabel>
          <InputText
            id="teamname"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveTeam();
              }
            }}
          />{" "}
          <label htmlFor="teamname">Csapat név</label>
        </FloatLabel>
      </div>

      <div className="mt-5 border-round">
        {isMobile ? (
          <Accordion multiple>
            {csapatok.map((team) => (
              <AccordionTab
                key={team.id}
                header={`${team.name} (${team.members.length} fő)`}
              >
                {team.members.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "0.5rem 0",
                    }}
                  >
                    <strong>{m.name}</strong> (#{m.rajt_szam})
                    <div>Körök: {m.laps.length}</div>
                    <div>
                      Összidő:{" "}
                      {secondsToHHMMSS(
                        m.laps.reduce((s, l) => s + l.time_ms, 0),
                      )}{" "}
                    </div>
                  </div>
                ))}
              </AccordionTab>
            ))}
          </Accordion>
        ) : (
          /* DESKTOP */
          <DataTable
            value={csapatok}
            dataKey="id"
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data)}
            rowExpansionTemplate={teamExpansionTemplate}
          >
            <Column expander style={{ width: "3rem" }} />
            <Column field="name" header="Csapat" />
            <Column
              header="Versenyzők"
              body={(t: TeamDetail) => t.members.length}
            />
          </DataTable>
        )}
      </div>
    </>
  );
}
