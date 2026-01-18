import type { TeamDetail } from "../../types/teams";

// TeamsMobile.tsx
const TeloCsapat = ({ team }: { team: TeamDetail[] }) => (
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
            <div>Összidő: {m.laps.reduce((s, l) => s + l.time_ms, 0)} ms</div>
          </div>
        ))}
      </AccordionTab>
    ))}
  </Accordion>
);
