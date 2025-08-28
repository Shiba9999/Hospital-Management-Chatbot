import React from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";

const DoctorCard = ({ doctor, index, onSelect }) => {
  return (
    <Card
      sx={{
        minWidth: 140,
        m: 1,
        bgcolor: "#e0f7fa",
        cursor: "pointer",
        borderRadius: 2,
        "&:hover": { boxShadow: 6 },
      }}
      onClick={() => onSelect(index + 1)} // sending 1,2,3 instead of 0,1,2
    >
      <CardContent sx={{ textAlign: "center" }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {doctor.doctor_name}
        </Typography>
        <Typography variant="body2" color="primary">
          {doctor.specialization}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Slots: {doctor.available_slots}
        </Typography>
        <Button
          variant="contained"
          size="small"
          sx={{ mt: 1 }}
          onClick={(e) => {
            e.stopPropagation(); // prevent double fire
            onSelect(index + 1);
          }}
        >
          Choose
        </Button>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
