"use client";
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const colorScheme = {
  primary: "#f3a833",
  secondary: "#f59e0b",
  gradient: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
  bgDark: "#000000",
  bgPaper: "rgba(20, 20, 20, 0.8)",
  border: "rgba(243, 168, 51, 0.2)",
};

const TabPanel = ({ children, value, index }) => {
  return (
    <AnimatePresence mode="wait">
      {value === index && (
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          sx={{ py: 4 }}
        >
          {children}
        </Box>
      )}
    </AnimatePresence>
  );
};

export default function DocsPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);

  const cardStyle = {
    background: colorScheme.bgPaper,
    backdropFilter: "blur(20px)",
    border: `1px solid ${colorScheme.border}`,
    borderRadius: 5,
    p: { xs: 3, md: 5 },
    color: "#fff",
  };

  const FlowNode = ({ title, desc, delay }) => (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      sx={{
        background: "rgba(30,30,30,0.8)",
        border: `1px solid ${colorScheme.border}`,
        borderRadius: 3,
        p: 3,
        textAlign: "center",
        width: "100%",
        maxWidth: 300,
        position: "relative",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} sx={{ color: colorScheme.primary, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
        {desc}
      </Typography>
    </Box>
  );

  const FlowArrow = () => (
    <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
      <Box sx={{ width: 2, height: 40, background: colorScheme.gradient, position: "relative" }}>
        <Box sx={{ position: "absolute", bottom: -5, left: -4, width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `10px solid ${colorScheme.secondary}` }} />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colorScheme.bgDark, pt: { xs: 4, md: 8 }, pb: 10 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 6, display: "flex", alignItems: "center", gap: 3 }}>
          <Box>
            <Typography variant="h3" fontWeight={900} sx={{ background: colorScheme.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1px" }}>
              Proposal Studio Documentation
            </Typography>
            <Typography variant="body1" sx={{ color: "#94a3b8", mt: 1 }}>
              Learn how to create, edit, and manage highly professional proposals.
            </Typography>
          </Box>
        </Box>

        <Paper elevation={0} sx={{ ...cardStyle, p: 0, overflow: "hidden" }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: `1px solid ${colorScheme.border}`, px: 3, pt: 2, background: "rgba(0,0,0,0.3)" }}>
            <Tabs
              value={tab}
              onChange={(e, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTab-root": { color: "#94a3b8", textTransform: "none", fontSize: "1.05rem", fontWeight: 600, minHeight: 64 },
                "& .Mui-selected": { color: "#f8fafc !important" },
                "& .MuiTabs-indicator": { background: colorScheme.gradient, height: 3, borderRadius: "3px 3px 0 0" },
              }}
            >
              <Tab icon={<DescriptionIcon sx={{ mb: 0, mr: 1 }} />} iconPosition="start" label="Creating Proposals" />
              <Tab icon={<EditIcon sx={{ mb: 0, mr: 1 }} />} iconPosition="start" label="Studio Basics" />
              <Tab icon={<DescriptionIcon sx={{ mb: 0, mr: 1 }} />} iconPosition="start" label="PDF Pages Guide" />
              <Tab icon={<AccountTreeIcon sx={{ mb: 0, mr: 1 }} />} iconPosition="start" label="Workflows" />
            </Tabs>
          </Box>

          <Box sx={{ p: { xs: 3, md: 5 } }}>
            {/* Create Proposal */}
            <TabPanel value={tab} index={0}>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#f8fafc", mb: 3 }}>
                How to Create a Professional Proposal
              </Typography>
              <Typography variant="body1" sx={{ color: "#94a3b8", mb: 4, lineHeight: 1.8 }}>
                The creation process is streamlined into a multi-step wizard. Follow these steps to accurately capture client data before entering the Visual Studio.
              </Typography>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ background: "rgba(255,255,255,0.03)", p: 3, borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)", height: "100%" }}>
                    <Typography variant="h6" sx={{ color: colorScheme.primary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <AddCircleOutlineIcon /> 1. Client Information
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 2, lineHeight: 1.7 }}>
                      Start by entering the <b>Client Name and Email</b>. 
                    </Typography>
                    <ul style={{ color: "#94a3b8", fontSize: "0.9rem", paddingLeft: "20px" }}>
                      <li>Your information is pre-filled automatically.</li>
                      <li><b>Smart Validation:</b> If you enter an email that already has an active proposal, the system will alert you and provide a "View Proposal" button to jump straight to it.</li>
                    </ul>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ background: "rgba(255,255,255,0.03)", p: 3, borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)", height: "100%" }}>
                    <Typography variant="h6" sx={{ color: colorScheme.primary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <AddCircleOutlineIcon /> 2. Project Details
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 2, lineHeight: 1.7 }}>
                      Enter the <b>Brand Name</b> and <b>Project Title</b>. The Title is dynamically generated based on the Brand Name you provide.
                    </Typography>
                    <ul style={{ color: "#94a3b8", fontSize: "0.9rem", paddingLeft: "20px" }}>
                      <li>Provide a detailed <b>Business Description</b> and <b>Proposed Solution</b>. These will be injected automatically into the PDF.</li>
                    </ul>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ background: "rgba(255,255,255,0.03)", p: 3, borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)", height: "100%" }}>
                    <Typography variant="h6" sx={{ color: colorScheme.primary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <AddCircleOutlineIcon /> 3. Costs & Pricing
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 2, lineHeight: 1.7 }}>
                      Configure the exact financial terms of the proposal.
                    </Typography>
                    <ul style={{ color: "#94a3b8", fontSize: "0.9rem", paddingLeft: "20px" }}>
                      <li>Toggle between currencies (USD, PKR, GBP, EUR, AED).</li>
                      <li>Set an <b>Advance Percentage</b>. The system will automatically calculate the final cost.</li>
                      <li>The cost is brilliantly formatted into words (e.g., "$ 500K") as you type!</li>
                    </ul>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ background: "rgba(255,255,255,0.03)", p: 3, borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)", height: "100%" }}>
                    <Typography variant="h6" sx={{ color: colorScheme.primary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <AddCircleOutlineIcon /> 4. Additional Details & Review
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 2, lineHeight: 1.7 }}>
                      Finally, select the <b>Call Outcome</b> (e.g., Interested, Follow-up) and set the Date. Once completed, click <b>Save & Continue to Studio</b> to open the visual editor.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Edit Proposal */}
            <TabPanel value={tab} index={1}>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#f8fafc", mb: 3 }}>
                Editing PDF Pages in the Studio
              </Typography>
              <Typography variant="body1" sx={{ color: "#94a3b8", mb: 4, lineHeight: 1.8 }}>
                Once the form is submitted, you are taken to the <b>Proposal Studio Editor</b>. Here, you can visually edit every single page of the PDF before finalizing it.
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Box sx={{ borderLeft: `4px solid ${colorScheme.primary}`, pl: 3 }}>
                  <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>Navigating & Toggling Pages</Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", lineHeight: 1.7 }}>
                    Use the <b>Left Sidebar (Report Slides)</b> to jump between different pages. You will see a live thumbnail of each page.
                    <br/><br/>
                    <b>Hidden Pages:</b> Next to the slide thumbnail, there is an <b>"Include" toggle</b>. You can use this to include or remove specific slides from the final PDF output.
                  </Typography>
                </Box>
                
                <Box sx={{ borderLeft: `4px solid ${colorScheme.primary}`, pl: 3 }}>
                  <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>Editing Text Content</Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", lineHeight: 1.7 }}>
                    The studio uses <b>EditableText</b> components. Any text that appears on the canvas can be clicked and edited inline. The changes are saved automatically to the Redux store.
                  </Typography>
                </Box>

                <Box sx={{ borderLeft: `4px solid ${colorScheme.primary}`, pl: 3 }}>
                  <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>Adding and Removing Sections</Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", lineHeight: 1.7 }}>
                    Certain pages support dynamic sections. For example, in the Visual Editors, you can add new rows, lists, or sections directly on the canvas without going back to the form.
                  </Typography>
                </Box>

                <Box sx={{ borderLeft: `4px solid ${colorScheme.primary}`, pl: 3 }}>
                  <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>Generating the Final PDF</Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", lineHeight: 1.7 }}>
                    When you are satisfied with the design and content, click the <b>Generate PDF</b> button. The system will compile the React components into a high-quality, professional PDF document ready to be sent to the client.
                  </Typography>
                </Box>
              </Box>
            </TabPanel>

            {/* PDF Pages Guide */}
            <TabPanel value={tab} index={2}>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#f8fafc", mb: 3 }}>
                Detailed Guide: PDF Pages & Editing
              </Typography>
              <Typography variant="body1" sx={{ color: "#94a3b8", mb: 4, lineHeight: 1.8 }}>
                Every page in the Proposal Studio acts differently. Below is a complete breakdown of each page type and how to update, add, or delete content sections within them.
              </Typography>

              <Grid container spacing={4}>
                {/* Cover Page */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ background: "rgba(255,255,255,0.03)", p: 3, borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)", height: "100%" }}>
                    <Typography variant="h6" sx={{ color: colorScheme.primary, mb: 1 }}>
                      1. Branded Cover Page
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 2 }}>
                      The introductory face of your proposal.
                    </Typography>
                    <ul style={{ color: "#94a3b8", fontSize: "0.9rem", paddingLeft: "20px", lineHeight: 1.6 }}>
                      <li><b>Update Text:</b> Click directly on the Date, "Prepared For", Brand Name, or Project Title to modify them using the inline text editor.</li>
                      <li><b>Auto-Fill:</b> Most of this data is automatically pulled from the Stepper form, but can be manually overridden here before PDF generation.</li>
                    </ul>
                  </Box>
                </Grid>

                {/* Custom Content / Overview */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ background: "rgba(255,255,255,0.03)", p: 3, borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)", height: "100%" }}>
                    <Typography variant="h6" sx={{ color: colorScheme.primary, mb: 1 }}>
                      2. Project Overview & Solution
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 2 }}>
                      Contains the Business Description and Proposed Solution.
                    </Typography>
                    <ul style={{ color: "#94a3b8", fontSize: "0.9rem", paddingLeft: "20px", lineHeight: 1.6 }}>
                      <li><b>Update Content:</b> Click any paragraph to rewrite it.</li>
                      <li><b>Structure:</b> You can format the text with line breaks or bullet points if necessary to make the overview easily scannable for the client.</li>
                    </ul>
                  </Box>
                </Grid>

                {/* Additional Info / Features */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ background: "rgba(255,255,255,0.03)", p: 3, borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)", height: "100%" }}>
                    <Typography variant="h6" sx={{ color: colorScheme.primary, mb: 1 }}>
                      3. Features & Roadmap (Additional Info)
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 2 }}>
                      Highly dynamic page for mapping out features or project phases.
                    </Typography>
                    <ul style={{ color: "#94a3b8", fontSize: "0.9rem", paddingLeft: "20px", lineHeight: 1.6 }}>
                      <li><b>Add Sections:</b> Use the visual editor tools (usually a "+" or "Add Section" button) to create new feature blocks or phases.</li>
                      <li><b>Delete Sections:</b> Hover over or click a section to reveal the delete/remove icon for sections you don't need.</li>
                      <li><b>Update Text:</b> Both section headers and paragraph bodies are fully editable via clicking.</li>
                    </ul>
                  </Box>
                </Grid>

                {/* Pricing */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ background: "rgba(255,255,255,0.03)", p: 3, borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)", height: "100%" }}>
                    <Typography variant="h6" sx={{ color: colorScheme.primary, mb: 1 }}>
                      4. Pricing Table & Packages
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 2 }}>
                      Visual representation of the project cost and deliverables.
                    </Typography>
                    <ul style={{ color: "#94a3b8", fontSize: "0.9rem", paddingLeft: "20px", lineHeight: 1.6 }}>
                      <li><b>Add/Del Rows:</b> You can add new feature list items to a package, or delete them if they don't apply.</li>
                      <li><b>Update Price:</b> The cost automatically converts based on your Stepper settings, but you can manually tweak the numbers or the "Advance Percentage" text directly.</li>
                    </ul>
                  </Box>
                </Grid>

                {/* About Humantek */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ background: "rgba(255,255,255,0.03)", p: 3, borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)", height: "100%" }}>
                    <Typography variant="h6" sx={{ color: colorScheme.primary, mb: 1 }}>
                      5. About Humantek
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 2 }}>
                      Standardized company profile page.
                    </Typography>
                    <ul style={{ color: "#94a3b8", fontSize: "0.9rem", paddingLeft: "20px", lineHeight: 1.6 }}>
                      <li><b>Update Text:</b> You can adjust the "About Us" copy to better resonate with the specific client's industry or needs.</li>
                      <li><b>Hide Page:</b> If the client is already familiar with Humantek, use the "Include" toggle on the left sidebar to completely hide this page from the final PDF.</li>
                    </ul>
                  </Box>
                </Grid>

                {/* Payment Terms */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ background: "rgba(255,255,255,0.03)", p: 3, borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)", height: "100%" }}>
                    <Typography variant="h6" sx={{ color: colorScheme.primary, mb: 1 }}>
                      6. Payment Terms & Conditions
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 2 }}>
                      Legal and payment agreements.
                    </Typography>
                    <ul style={{ color: "#94a3b8", fontSize: "0.9rem", paddingLeft: "20px", lineHeight: 1.6 }}>
                      <li><b>Add/Del Points:</b> Add new specific clauses or delete standard ones that don't apply to this contract.</li>
                      <li><b>Update Text:</b> Modify the standard terms inline to reflect any custom agreements made during the sales call.</li>
                    </ul>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Workflows */}
            <TabPanel value={tab} index={3}>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#f8fafc", mb: 5, textAlign: "center" }}>
                System Workflows
              </Typography>
              
              <Grid container spacing={6}>
                {/* Creation Flow */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ background: "rgba(0,0,0,0.4)", p: 4, borderRadius: 4, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Typography variant="h6" sx={{ color: "#fff", mb: 4, textAlign: "center", fontWeight: 700 }}>
                      Proposal Creation Flow
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <FlowNode title="1. Dashboard" desc="Click 'Create New Proposal'" delay={0.1} />
                      <FlowArrow />
                      <FlowNode title="2. Stepper Form" desc="Fill Client Info, Project Details, Costs, and Outcome" delay={0.3} />
                      <FlowArrow />
                      <FlowNode title="3. Form Submission" desc="Data is saved to database. Redirected to Visual Editor." delay={0.5} />
                      <FlowArrow />
                      <FlowNode title="4. Proposal Studio" desc="Visually adjust design & text before PDF generation" delay={0.7} />
                    </Box>
                  </Box>
                </Grid>

                {/* Edit Flow */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ background: "rgba(0,0,0,0.4)", p: 4, borderRadius: 4, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Typography variant="h6" sx={{ color: "#fff", mb: 4, textAlign: "center", fontWeight: 700 }}>
                      Studio Editing Flow
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <FlowNode title="1. Visual Canvas" desc="Select a slide from the left sidebar or toggle its visibility" delay={0.2} />
                      <FlowArrow />
                      <FlowNode title="2. Inline Editing" desc="Click text or sections to edit content directly" delay={0.4} />
                      <FlowArrow />
                      <FlowNode title="3. Auto-Save" desc="Changes to the UI state are managed via Redux automatically" delay={0.6} />
                      <FlowArrow />
                      <FlowNode title="4. Generate PDF" desc="Compile the React canvas into a downloadable PDF file" delay={0.8} />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
