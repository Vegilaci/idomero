import React, { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { getTeams } from "../api/teams";
import type { TeamDetail } from "../types/teams";

export default function Csapatok() {
  const [value, setValue] = useState<string>("");
  const [csapatok, setCsapatok] = useState<TeamDetail[]>([]);
  useEffect(() => {
    getTeams().then(setCsapatok);
  }, []);

  return (
    <>
      <div className="card flex justify-content-center gap-3">
        <FloatLabel>
          <InputText
            id="username"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValue(e.target.value)
            }
          />
          <label htmlFor="username">Username</label>
        </FloatLabel>
      </div>

      <div className="flex flex-row justify-content-center gap-8 mt-5">
        {csapatok.map((csapat) => (
          <div key={csapat.id}>
            <h3>{csapat.name}</h3>
            <p>{csapat.members.map((member) => member.name)}</p>
          </div>
        ))}
      </div>
    </>
  );
}
