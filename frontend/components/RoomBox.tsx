import { Bold } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

interface RoomBoxProps {
  roomType: string;
  backgroundColor?: string;
  roomsubColor?: string;
  roomNumber: string;
  isAvailable: Boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const RoomBox = ({
  roomType,
  backgroundColor = "#FCDC73",
  roomsubColor = "#000000",
  roomNumber,
  isAvailable = true,
  onClick = () => {},
}: RoomBoxProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={!isAvailable}
      style={{
        backgroundColor: isAvailable ? backgroundColor : "#D5D5D5",
        fontWeight: "bolder",
        cursor: isAvailable ? "pointer" : "not-allowed",
      }}
      className="flex h-full p-2 m-auto w-full flex-col items-center justify-center rounded-2xl"
    >
      <div
        className="w-full flex flex-row items-center justify-center"
        style={{ gap: isAvailable ? "0" : "5px" }}
      >
        <h1 style={{ color: isAvailable ? roomsubColor : "black" }}>Room</h1>
        <div
          className="bg-gray-500 text-white px-2 rounded-sm"
          style={{
            paddingLeft: isAvailable ? "0px" : "8px",
            paddingRight: isAvailable ? "0px" : "8px",
          }}
        >
          {isAvailable ? "" : "Booked"}
        </div>
      </div>

      <h1 className="text-[#193948] font-bold text-4xl uppercase">
        {roomNumber}
      </h1>

      <h1
        style={{
          color: isAvailable ? roomsubColor : "black",
          fontWeight: "bold",
        }}
      >
        {roomType}
      </h1>
    </Button>
  );
};
