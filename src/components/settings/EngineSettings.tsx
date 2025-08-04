import { EngineLimits } from "@/api";
import { BoardSettings } from "@/board";
import SettingsSlider from "./SettingsSlider";

interface EngineSettingsProps {
    show: boolean;
    settings: BoardSettings;
    limits: EngineLimits;
    onSettingsChange: (v: BoardSettings) => void;
}

export default function EngineSettings({
    show,
    settings,
    limits,
    onSettingsChange,
} : EngineSettingsProps) {

    return (
        show ? (
            <>
                <SettingsSlider
                  value={settings.engineDepth}
                  onChange={(v) => onSettingsChange({...settings, engineDepth: v as number})}
                  min={1}
                  max={limits.depth}
                  step={1}
                  label="Engine Depth"
                  description="Maximum number of moves engine can think ahead"
                />
                <SettingsSlider
                  value={settings.nThreads}
                  onChange={(v) => onSettingsChange({...settings, nThreads: v as number})}
                  min={1}
                  max={limits.threads}
                  step={1}
                  label='Threads'
                  description="Number of searching threads, speeds up the search"
                />
              
                <SettingsSlider
                  formatter={(v) => `${v} MB`}
                  value={settings.memorySizeMb}
                  onChange={(v) => onSettingsChange({...settings, memorySizeMb: v as number})}
                  min={1}
                  max={limits.mbsize}
                  step={1}
                  label='Memory'
                  description="Maximum size of the search tree, increases number of searched positions"
                />
            </>) 
        : <></>
    )
}