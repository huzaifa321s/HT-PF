 <form onSubmit={handleSubmit}>
                  {/* === Your Information === */}
                  <CardContent
                    sx={{
                      p: { xs: 2, sm: 3, md: 4 },
                      mb: 3,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      mb={3}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "transparent",
                          color: "primary.main",
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Info />
                      </Avatar>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="text.primary"
                      >
                        Your Information
                      </Typography>
                    </Stack>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        {fetchingBD ? (
                          <Skeleton
                            variant="rectangular"
                            height={56}
                            sx={{ borderRadius: 2 }}
                          />
                        ) : (
                          <Autocomplete
                            options={options}
                            getOptionLabel={(option) => option.name}
                            value={formData.selectedBDM}
                            onChange={(e, newValue) => {
                              setFormData({
                                ...formData,
                                selectedBDM: newValue,
                                email: newValue ? newValue.email : "",
                              });
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select BDM Name"
                                inputRef={(el) => (inputRefs.current[0] = el)}
                                onKeyDown={(e) => handleKeyDown(e, 0)}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    bgcolor: "background.paper",
                                  },
                                }}
                              />
                            )}
                          />
                        )}
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Email Address"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          type="email"
                          inputRef={(el) => (inputRefs.current[1] = el)}
                          onKeyDown={(e) => handleKeyDown(e, 1)}
                          InputLabelProps={{
                            shrink: Boolean(formData.email),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: "background.paper",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>

                  {/* === Client Information === */}
                  <CardContent
                    sx={{
                      p: { xs: 2, sm: 3, md: 4 },
                      mb: 3,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      mb={3}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "transparent",
                          color: "primary.main",
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Info />
                      </Avatar>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="text.primary"
                      >
                        Client Information
                      </Typography>
                    </Stack>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Client Name"
                          name="clientName"
                          value={formData.clientName}
                          onChange={handleChange}
                          required
                          inputRef={(el) => (inputRefs.current[2] = el)}
                          onKeyDown={(e) => handleKeyDown(e, 2)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: "background.paper",
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Client Email"
                          name="clientEmail"
                          value={formData.clientEmail}
                          onChange={handleChange}
                          type="email"
                          inputRef={(el) => (inputRefs.current[3] = el)}
                          onKeyDown={(e) => handleKeyDown(e, 3)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: "background.paper",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>

                  {/* === Project Details === */}
                  <CardContent
                    sx={{
                      p: { xs: 2, sm: 3, md: 4 },
                      mb: 3,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      mb={3}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "transparent",
                          color: "primary.main",
                          width: 48,
                          height: 48,
                        }}
                      >
                        <DeblurOutlined />
                      </Avatar>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="text.primary"
                      >
                        Project Details
                      </Typography>
                    </Stack>

                    <Grid
                      container
                      spacing={3}
                      sx={{ display: "flex", flexDirection: "column" }}
                    >
                      {/* Brand Name */}
                      <TextField
                        label="Brand Name"
                        name="brandName"
                        value={formData.brandName}
                        onChange={handleChange}
                        inputRef={(el) => (inputRefs.current[4] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 4)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "background.paper",
                          },
                        }}
                      />

                      {/* Project Title */}
                      <TextField
                        label="Project Title"
                        name="projectTitle"
                        value={formData.projectTitle}
                        onChange={handleChange}
                        inputRef={(el) => (inputRefs.current[5] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 5)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "background.paper",
                          },
                        }}
                      />

                      {/* Business Description */}
                      <TextField
                        label="Business Description"
                        name="businessDescription"
                        multiline
                        rows={5}
                        value={formData.businessDescription}
                        onChange={handleChange}
                        disabled={processing}
                        inputRef={(el) => (inputRefs.current[6] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 6)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "background.paper",
                          },
                        }}
                      />
                      {processing && (
                        <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
                      )}

                      {/* Proposed Solution */}
                      <TextField
                        label="Proposed Solution"
                        name="proposedSolution"
                        multiline
                        rows={5}
                        value={formData.proposedSolution}
                        onChange={handleChange}
                        disabled={processing}
                        inputRef={(el) => (inputRefs.current[7] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 7)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "background.paper",
                          },
                        }}
                      />
                      {processing && (
                        <LinearProgress
                          color="success"
                          sx={{ mt: 1, borderRadius: 1 }}
                        />
                      )}

                      {/* Development Platforms */}
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Development Platforms</InputLabel>
                          <Select
                            multiple
                            value={formData.developmentPlatforms}
                            onChange={handleSelectChange}
                            inputRef={(el) => (inputRefs.current[8] = el)}
                            onKeyDown={(e) => handleKeyDown(e, 8)}
                            sx={{
                              borderRadius: 2,
                              bgcolor: "background.paper",
                            }}
                          >
                            {platformOptions.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <Grid container spacing={1} mt={2}>
                          <Grid item xs={12}>
                            <TextField
                              size="small"
                              placeholder="Add custom platform"
                              value={customPlatform}
                              onChange={(e) =>
                                setCustomPlatform(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCustom();
                                }
                              }}
                              inputRef={(el) => (inputRefs.current[9] = el)}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                  bgcolor: "background.paper",
                                },
                              }}
                            />
                          </Grid>
                          <Grid
                            item
                            xs={12}
                            container
                            justifyContent="flex-end"
                          >
                            <IconButton
                              onClick={handleAddCustom}
                              sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                borderRadius: 2,
                              }}
                            >
                              <Add />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>

                  {/* === Timeline and Costs === */}
                  <CardContent
                    sx={{
                      p: { xs: 2, sm: 3, md: 4 },
                      mb: 3,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      mb={3}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "transparent",
                          color: "primary.main",
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Timeline />
                      </Avatar>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="text.primary"
                      >
                        Timeline and Costs
                      </Typography>
                    </Stack>

                    <Grid
                      container
                      spacing={3}
                      sx={{ display: "flex", flexDirection: "column" }}
                    >
                      <TextField
                        label="Project Duration"
                        name="projectDuration"
                        value={formData.projectDuration}
                        onChange={handleChange}
                        inputRef={(el) => (inputRefs.current[10] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 10)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "background.paper",
                          },
                        }}
                      />
                      <TextField
                        label="Advance Payment (%)"
                        name="advancePercent"
                        value={formData.advancePercent}
                        onChange={handleChange}
                        type="number"
                        inputRef={(el) => (inputRefs.current[11] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 11)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "background.paper",
                          },
                        }}
                      />

                      <TextField
                        label="Additional Costs"
                        name="additionalCosts"
                        value={formData.additionalCosts}
                        onChange={handleChange}
                        inputRef={(el) => (inputRefs.current[12] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 12)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "background.paper",
                          },
                        }}
                      />

                      <TextField
                        label="Timeline / Milestones"
                        name="timelineMilestones"
                        multiline
                        rows={5}
                        value={formData.timelineMilestones}
                        onChange={handleChange}
                        inputRef={(el) => (inputRefs.current[13] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 13)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "background.paper",
                          },
                        }}
                      />

                      {/* Charge Amount */}
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="text.primary"
                          >
                            Charge Amount ({currency === "USD" ? "$" : "₨"})
                          </Typography>
                          <ToggleButtonGroup
                            value={currency}
                            exclusive
                            onChange={handleCurrencyChange}
                            size="small"
                          >
                            <ToggleButton value="USD">
                              <AttachMoney sx={{ fontSize: 16, mr: 0.5 }} /> USD
                            </ToggleButton>
                            <ToggleButton value="PKR">
                              <CurrencyRupee sx={{ fontSize: 16, mr: 0.5 }} />{" "}
                              PKR
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </Box>

                        <Stack spacing={2}>
                          {formData.recommended_services?.length > 0 ? (
                            <>
                              {formData.recommended_services.map(
                                (service, index) => (
                                  <Grid
                                    container
                                    spacing={2}
                                    key={index}
                                    alignItems="center"
                                  >
                                    <Grid item xs={8}>
                                      <TextField
                                        label={service}
                                        value={
                                          formData.serviceCharges?.[index] || ""
                                        }
                                        onChange={(e) => {
                                          const newCharges = [
                                            ...(formData.serviceCharges || []),
                                          ];
                                          newCharges[index] = e.target.value;
                                          setFormData((prev) => ({
                                            ...prev,
                                            serviceCharges: newCharges,
                                          }));
                                        }}
                                        type="number"
                                        inputRef={(el) =>
                                          (inputRefs.current[14 + index] = el)
                                        }
                                        onKeyDown={(e) =>
                                          handleKeyDown(e, 14 + index)
                                        }
                                        sx={{
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            bgcolor: "background.paper",
                                          },
                                        }}
                                      />
                                    </Grid>
                                    <Grid item xs={4}>
                                      <TextField
                                        label="Sub-Total"
                                        value={`${
                                          currency === "USD" ? "$" : "₨"
                                        }${(
                                          parseFloat(
                                            formData.serviceCharges?.[index] ||
                                              "0"
                                          ) || 0
                                        ).toFixed(2)}`}
                                        disabled
                                        sx={{
                                          "& .Mui-disabled": {
                                            bgcolor: "background.default",
                                          },
                                        }}
                                      />
                                    </Grid>
                                  </Grid>
                                )
                              )}

                              {/* 👇 Grand Total Box */}
                              <Box
                                sx={{
                                  mt: 2,
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: "primary.main",
                                  color: "white",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  fontWeight: "bold",
                                  fontSize: "1.1rem",
                                  boxShadow: 3,
                                }}
                              >
                                <Typography variant="subtitle1">
                                  Grand Total
                                </Typography>
                                <Typography variant="h6">
                                  {currency === "USD" ? "$" : "₨"}
                                  {(
                                    (formData.serviceCharges || []).reduce(
                                      (sum, val) =>
                                        sum + (parseFloat(val) || 0),
                                      0
                                    ) || 0
                                  ).toFixed(2)}
                                </Typography>
                              </Box>
                            </>
                          ) : (
                            <TextField
                              label={`Total Charge Amount (${
                                currency === "USD" ? "$" : "₨"
                              })`}
                              name="chargeAmount"
                              value={formData.chargeAmount}
                              onChange={handleChange}
                              type="number"
                              inputRef={(el) => (inputRefs.current[20] = el)}
                              onKeyDown={(e) => handleKeyDown(e, 20)}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                  bgcolor: "background.paper",
                                },
                              }}
                            />
                          )}
                        </Stack>
                      </Grid>

                      {/* Services Summary */}
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 3,
                          }}
                        >
                          <Box
                            sx={{
                              minWidth: 80,
                              textAlign: "center",
                              bgcolor: "primary.main",
                              color: "white",
                              borderRadius: 2,
                              p: 2,
                            }}
                          >
                            <Typography variant="h5" fontWeight={800}>
                              {formData.recommended_services?.length || 0}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontSize: "0.7rem" }}
                            >
                              Services
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            {formData.recommended_services?.length > 0 ? (
                              <Stack spacing={1.5}>
                                {formData.recommended_services.map(
                                  (service, i) => (
                                    <Box
                                      key={i}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        color: "#000",
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: "50%",

                                          bgcolor: "success.main",
                                        }}
                                      />
                                      <Typography>{service}</Typography>
                                    </Box>
                                  )
                                )}
                              </Stack>
                            ) : (
                              <Typography
                                color="text.secondary"
                                fontStyle="italic"
                              >
                                No services recommended yet.
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>


                  {/* === Additional Details === */}
                  <CardContent
                    sx={{
                      p: { xs: 2, sm: 3, md: 4 },
                      mb: 3,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      mb={3}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "transparent",
                          color: "primary.main",
                          width: 48,
                          height: 48,
                        }}
                      >
                        <CheckCircle />
                      </Avatar>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="text.primary"
                      >
                        Additional Details
                      </Typography>
                    </Stack>

                    <Grid
                      container
                      spacing={3}
                      sx={{ display: "flex", flexDirection: "column" }}
                    >
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Call Outcome</InputLabel>
                          <Select
                            name="callOutcome"
                            value={formData.callOutcome}
                            onChange={handleChange}
                            inputRef={(el) => (inputRefs.current[30] = el)}
                            onKeyDown={(e) => handleKeyDown(e, 30)}
                            sx={{
                              borderRadius: 2,
                              bgcolor: "background.paper",
                            }}
                          >
                            <MenuItem value="Interested">Interested</MenuItem>
                            <MenuItem value="No Fit">No Fit</MenuItem>
                            <MenuItem value="Flaked">Flaked</MenuItem>
                            <MenuItem value="Follow-up">Follow-up</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        {/* Simple Chip – No extra import */}
                        <Chip
                          icon={<CalendarMonth />}
                          label={`Date: ${formData.date}`}
                          sx={{
                            height: 56,
                            width: "100%",
                            fontSize: "1rem",
                            bgcolor: "background.default",
                            color: "primary.main",
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        />
                      </Grid>

                      <TextField
                        label="Terms & Conditions"
                        name="terms"
                        multiline
                        rows={5}
                        value={formData.terms}
                        onChange={handleChange}
                        inputRef={(el) => (inputRefs.current[31] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 31)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "background.paper",
                          },
                        }}
                      />
                    </Grid>
                  </CardContent>

                  {/* === Submit Button === */}
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                  >
                    <Button
                      variant="contained"
                      type="submit"
                      size="large"
                      disabled={isLoading || processing}
                      startIcon={isLoading ? null : <Send />}
                      ref={(el) => (inputRefs.current[32] = el)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      sx={{
                        px: 6,
                        py: 2,
                        borderRadius: 3,
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        minWidth: { xs: "100%", sm: 300 },
                        boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                        "&:hover": {
                          boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      {isLoading
                        ? "Generating Proposal..."
                        : "Generate Proposal PDF"}
                    </Button>
                  </Box>
                </form>