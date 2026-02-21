import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    subjectsWithAttendance: [],
    isLoading: false,
    currentAttendance: null
};

// Get subjects with attendance by user ID
export const getSubjectsWithAttendance = createAsyncThunk(
    "attendance/getByUser",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `https://attendance-management-system-backen.vercel.app/api/v1/teacher/attendance/user/${userId}`
            );

            if (response.status !== 200) {
                return rejectWithValue(response.data);
            }

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Create new attendance record
export const createAttendance = createAsyncThunk(
    "attendance/create",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                "https://attendance-management-system-backen.vercel.app/api/v1/teacher/attendance/",
                formData
            );

            if (response.status !== 201) {
                return rejectWithValue(response.data);
            }

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Update attendance record
export const updateAttendance = createAsyncThunk(
    "attendance/update",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `https://attendance-management-system-backen.vercel.app/api/v1/teacher/attendance/${id}`,
                formData
            );

            if (response.status !== 200) {
                return rejectWithValue(response.data);
            }

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Delete attendance record
export const deleteAttendance = createAsyncThunk(
    "attendance/delete",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.delete(
                `https://attendance-management-system-backen.vercel.app/api/v1/teacher/attendance/${id}`
            );

            if (response.status !== 200) {
                return rejectWithValue(response.data);
            }

            return { ...response.data, deletedId: id };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const attendanceSlicer = createSlice({
    name: "attendance",
    initialState: initialState,
    reducers: {
        clearAttendance: (state) => {
            state.subjectsWithAttendance = [];
            state.currentAttendance = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Subjects with Attendance by User
            .addCase(getSubjectsWithAttendance.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getSubjectsWithAttendance.fulfilled, (state, action) => {
                state.isLoading = false;
                state.subjectsWithAttendance = action.payload.data || [];
            })
            .addCase(getSubjectsWithAttendance.rejected, (state, action) => {
                state.isLoading = false;
                state.subjectsWithAttendance = [];
            })

            // Create Attendance
            .addCase(createAttendance.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createAttendance.fulfilled, (state, action) => {
                state.isLoading = false;

                const newAttendance = action.payload.data;
                const subjectId = newAttendance.subjectId._id || newAttendance.subjectId;
                const dateKey = new Date(newAttendance.date).toISOString().split('T')[0];

                const subjectIndex = state.subjectsWithAttendance.findIndex(
                    subject => subject.id === subjectId
                );

                if (subjectIndex !== -1) {
                    const subject = state.subjectsWithAttendance[subjectIndex];

                    if (!subject.attendance[dateKey]) {
                        subject.attendance[dateKey] = [];
                    }

                    subject.attendance[dateKey].push({
                        id: newAttendance._id,
                        studentName: newAttendance.studentName,
                        rollNo: newAttendance.rollNo,
                        discipline: newAttendance.discipline,
                        time: newAttendance.time,
                        subject: subject.name
                    });
                }
            })
            .addCase(createAttendance.rejected, (state, action) => {
                state.isLoading = false;
            })

            // Update Attendance
            .addCase(updateAttendance.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateAttendance.fulfilled, (state, action) => {
                state.isLoading = false;

                const updatedAttendance = action.payload.data;
                const attendanceId = updatedAttendance._id;
                const dateKey = new Date(updatedAttendance.date).toISOString().split('T')[0];

                for (const subject of state.subjectsWithAttendance) {
                    if (subject.attendance[dateKey]) {
                        const attendanceIndex = subject.attendance[dateKey].findIndex(
                            record => record.id === attendanceId
                        );

                        if (attendanceIndex !== -1) {
                            subject.attendance[dateKey][attendanceIndex] = {
                                id: updatedAttendance._id,
                                studentName: updatedAttendance.studentName,
                                rollNo: updatedAttendance.rollNo,
                                time: updatedAttendance.time,
                                subject: subject.name
                            };
                            break;
                        }
                    }
                }
            })
            .addCase(updateAttendance.rejected, (state, action) => {
                state.isLoading = false;
            })

            // Delete Attendance
            .addCase(deleteAttendance.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteAttendance.fulfilled, (state, action) => {
                state.isLoading = false;

                const deletedId = action.payload.deletedId;

                for (const subject of state.subjectsWithAttendance) {
                    for (const dateKey in subject.attendance) {
                        subject.attendance[dateKey] = subject.attendance[dateKey].filter(
                            record => record.id !== deletedId
                        );

                        if (subject.attendance[dateKey].length === 0) {
                            delete subject.attendance[dateKey];
                        }
                    }
                }
            })
            .addCase(deleteAttendance.rejected, (state, action) => {
                state.isLoading = false;
            });
    },
});

export const {
    clearAttendance,
} = attendanceSlicer.actions;

export default attendanceSlicer.reducer;