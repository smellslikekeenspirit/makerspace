import React from "react";
import styled from "styled-components";

const StyledDiv = styled.div<{ marginTop: number }>`
  margin-top: ${(props) => props.marginTop}px;
  margin-right: 0px;
  height: 33vh;

  .time-label {
    height: 3.85vh;
    margin-bottom: .3vh;
    text-align: end;
    font-size: 1vh;
  }
`;

// cs professors in shambles
const HourLabels = [
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
  "8 PM",
  "9 PM",
];

interface TimeLabelStripProps {
  marginTop?: number;
}

export default function TimeLabelStrip({ marginTop = 0 }: TimeLabelStripProps) {
  return (
    <StyledDiv marginTop={marginTop}>
      <div className="time-labels">
        {Array.from(Array(13)).map((_, i) => (
          <div className="time-label" key={i}>
            {HourLabels[i]}
          </div>
        ))}
      </div>
    </StyledDiv>
  );
}
