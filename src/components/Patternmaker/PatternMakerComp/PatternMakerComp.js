import React, { useState, useEffect } from "react";
import * as Tone from "tone";
import { useDispatch, useSelector } from "react-redux";

import {
  selectSeqPattern,
  seqSettings,
} from "../../../store/seqState/selectors";

import { PatternUpdater } from "../../../store/seqState/actions";

let notes = ["A1", "B1"];

const vol = new Tone.Volume(-12).toDestination();
const lpfilter = new Tone.Filter().connect(vol);
const feedbackDelay = new Tone.FeedbackDelay("12n", 0).connect(lpfilter);

const samples = new Tone.Sampler({
  urls: {
    A1: "/Loud/bdfilm.wav",
    B1: "/Loud/jaydeesnare.wav",
    C1: "/Metal/cowbell.wav",
    D1: "/Metal/hih.wav",
    E1: "/Soft/conga.wav",
    F1: "/Soft/snap.wav",
    G1: "/Wood/kick.wav",
    A2: "/Wood/clap.wav",
  },
  baseUrl: "http://127.0.0.1:5500/src/data/Drumsounds",
}).connect(feedbackDelay);

export default function PatternMakerComp(props) {
  const dispatch = useDispatch();

  const seqPattern = useSelector(selectSeqPattern);
  const seqSetting = useSelector(seqSettings);
  const [pattern, updatePattern] = useState(seqPattern.pattern); //INIT BY REDUX STATE

  // PATTERN UPDATER FROM SELECT
  useEffect(() => {
    updatePattern(seqPattern.pattern);
  }, [seqPattern.pattern]);

  useEffect(() => {
    const loop = new Tone.Sequence(
      (time, col) => {
        pattern.map((row, noteIndex) => {
          if (row[col]) {
            samples.triggerAttackRelease(notes[noteIndex], "16n", time);
          }
        });
      },
      [0, 1, 2, 3, 4, 5, 6, 7],
      "8n"
    ).start(0);
    return () => loop.dispose();
  }, [pattern]);

  // Update pattern by making a copy and inverting the value :S WHYYY??????
  function setPattern({ x, y, value }) {
    const patternCopy = [...pattern];
    patternCopy[y][x] = +!value;
    updatePattern(patternCopy);
  }

  switch (seqSetting.seqSoundSelected) {
    case "Loud":
      notes = ["B1", "A1"];
      break;
    case "Electronic":
      notes = ["D1", "C1"];
      break;
    case "Percussion":
      notes = ["F1", "E1"];
      break;
    case "Neo-Soul":
      notes = ["A2", "G1"];
      break;
    default:
      notes = ["E2", "G1"];
  }

  // SOUND EFFECTS
  useEffect(() => {
    vol.volume.value = seqSetting.seqSettingsvol;
  }, [seqSetting.seqSettingsvol]);

  useEffect(() => {
    feedbackDelay.wet.value = seqSetting.seqSettingsdel;
    feedbackDelay.feedback.value = seqSetting.seqSettingsdel;
  }, [seqSetting.seqSettingsdel]);

  useEffect(() => {
    lpfilter.frequency.value = seqSetting.seqSettingsfilter;
  }, [seqSetting.seqSettingsfilter]);

  return (
    <div className="Pattern-style">
      {/* <p>{(activeColumn + 1) / 2 + 0.5} </p> */}

      <div
        className="pattern-seqrows"
        style={{
          border: `1px solid ${seqPattern.color}`,
          background: "rgba(1,1,1,0.7)",
        }}
      >
        {seqPattern.pattern.map((row, y) => (
          <div key={y}>
            {row.map((value, x) => (
              <button
                key={x}
                style={
                  value === 1
                    ? {
                        background: `linear-gradient(to left, rgba(0,0,0,1), ${seqPattern.color})`,
                        border: seqPattern.color,
                      }
                    : {
                        background: "rgba(0,0,0,0.4)",
                        border: seqPattern.color,
                      }
                }
                onClick={() => {
                  setPattern({ x, y, value });
                  dispatch(PatternUpdater(pattern));
                }}
              ></button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
