"use client";
import { useEffect, useState, useRef } from "react";
import { Box, Paper, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { showToast, hideToast } from "../utils/toastSlice";
import { usePrompt } from "../hooks/usePrompt";
import axiosInstance from "../utils/axiosInstance";
import { setFormDataRT } from "../utils/formDataSlice";
import ProposalFormWithStepper from "./ProposalFormwithStepper";
import { resetForm } from "../utils/proposalSlice";

export default function App() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const inputRefs = useRef({});

  const formDataRT = useSelector((state) => state.form);
  const proposalState = useSelector((s) => s.proposal);

  const [formData, setFormData] = useState(formDataRT);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    reset,
    register,
    trigger,
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      clientName: "abc",
      clientEmail: "client@gmail.com",
      projectTitle: "Word Press E-commerce Website",
      developmentPlatforms: [],
      projectDuration: "",
      chargeAmount: "",
      advancePercent: "",
      additionalCosts: "",
      brandName: "Humantek",
      proposedBy: "",
      projectBrief: "",
      businessType: "",
      industoryTitle: "",
      strategicProposal: [],
      brandTagline: "",
      sweeterFashionPresence: "",
      selectedBDM: null,
      recommended_services: [],
      timelineMilestones: "",
      terms: "",
      callOutcome: "Interested",
      yourName: "",
      yourEmail: "",
      date: "",
    },
  });

  useEffect(() => {
    if (proposalState && proposalState.isUnsavedEdit && !proposalState._id) {
      reset({ ...getValues(), ...proposalState });
      setFormData((prev) => ({ ...prev, ...proposalState }));
    } else {
      // Clear redux state to prevent old proposal's unsaved edits bleeding into new creation
      dispatch(resetForm());
    }
  }, []);

  usePrompt(true);

  // Scroll to first error field
  useEffect(() => {
    if (Object.keys(errors).length === 0) return;

    const firstErrorKey = Object.keys(errors)[0];
    const errorElement = inputRefs.current[firstErrorKey];

    if (errorElement) {
      errorElement.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => {
        const input =
          errorElement.querySelector("input") ||
          errorElement.querySelector("textarea") ||
          errorElement.querySelector("[role='button']");
        if (input) input.focus();
      }, 300);
    }
  }, [errors]);

  const generatePdfActual = async (data, currency) => {
    setLoading(true);

    try {
      // 1. Data is already saved to Redux via setFullFormData in ProposalFormWithStepper
      dispatch(showToast({ message: "Draft saved! Redirecting to Studio...", severity: "success" }));

      // 2. Redirect to Proposal Studio without hitting database
      router.push(`/proposal-studio/new`);
    } catch (err) {
      console.error(err);
      dispatch(hideToast());
      dispatch(
        showToast({
          message: err.message || "Proposal generation failed",
          severity: "error",
        })
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/get-creds");

        if (res.data?.success && res.data.data) {
          const { name, email } = res.data.data;

          const updatedData = {};
          if (name) updatedData.yourName = name;
          if (email) updatedData.yourEmail = email;

          if (Object.keys(updatedData).length > 0) {
            setFormData((prevData) => ({ ...prevData, ...updatedData }));
            dispatch(setFormDataRT({ ...formData, ...updatedData }));
            reset({ ...getValues(), ...updatedData });
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <Box
      sx={{
        bgcolor: "#000000",
        minHeight: "100vh",
        py: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Container maxWidth="lg">
        <Paper
          sx={{
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.7)",
            bgcolor: "#141414",
            backdropFilter: "blur(10px)",
            p: { xs: 2, sm: 3, md: 4 },
            border: "1px solid rgba(243, 168, 51, 0.1)",
          }}
        >
          <ProposalFormWithStepper
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            handleSubmit={handleSubmit}
            handleSubmitForm={generatePdfActual}
            inputRefs={inputRefs}
            register={register}
            isLoading={isLoading}
            formData={formData}
            trigger={trigger}
          />
        </Paper>
      </Container>
    </Box>
  );
}
