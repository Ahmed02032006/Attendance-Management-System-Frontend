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
            return rejectWithValue(error.response?.data || error.message);
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

            console.log('Create attendance response:', response.data);

            if (response.status !== 201) {
                return rejectWithValue(response.data);
            }

            return response.data;
        } catch (error) {
            console.error('Create attendance error:', error.response?.data || error.message);
            
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message);
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
            return rejectWithValue(error.response?.data || error.message);
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
            return rejectWithValue(error.response?.data || error.message);
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
                
                // Handle both cases: when subjectId is populated or just an ID
                const subjectId = newAttendance.subjectId?._id || newAttendance.subjectId;
                const scheduleId = newAttendance.scheduleId; // Get scheduleId
                const dateKey = new Date(newAttendance.date).toISOString().split('T')[0];

                const subjectIndex = state.subjectsWithAttendance.findIndex(
                    subject => subject.id === subjectId
                );

                if (subjectIndex !== -1) {
                    const subject = state.subjectsWithAttendance[subjectIndex];

                    // Initialize attendance structure if it doesn't exist
                    if (!subject.attendance) {
                        subject.attendance = {};
                    }

                    // Initialize date object if it doesn't exist
                    if (!subject.attendance[dateKey]) {
                        subject.attendance[dateKey] = {};
                    }

                    // Initialize schedule object if it doesn't exist
                    if (!subject.attendance[dateKey][scheduleId]) {
                        // Get the schedule from classSchedule
                        const schedule = subject.classSchedule?.find(s => s._id === scheduleId) || null;
                        
                        // Initialize with all registered students marked as absent
                        const registeredStudents = subject.registeredStudents || [];
                        
                        subject.attendance[dateKey][scheduleId] = {
                            schedule: schedule,
                            students: registeredStudents.map(student => ({
                                id: null,
                                studentName: student.studentName,
                                rollNo: student.registrationNo,
                                discipline: null,
                                time: null,
                                title: subject.title,
                                status: 'Absent'
                            }))
                        };
                    }

                    // Get the subject title
                    const subjectTitle = newAttendance.subjectId?.subjectTitle || subject.title;

                    // Create the attendance record
                    const attendanceRecord = {
                        id: newAttendance._id,
                        studentName: newAttendance.studentName,
                        rollNo: newAttendance.rollNo,
                        discipline: newAttendance.discipline,
                        time: newAttendance.time,
                        title: subjectTitle,
                        subjectId: subjectId,
                        subject: subjectTitle,
                        status: 'Present'
                    };

                    // Find if student already exists in the students array
                    const studentsArray = subject.attendance[dateKey][scheduleId].students;
                    const existingStudentIndex = studentsArray.findIndex(
                        s => s.rollNo === attendanceRecord.rollNo
                    );

                    if (existingStudentIndex !== -1) {
                        // Update existing student record
                        studentsArray[existingStudentIndex] = attendanceRecord;
                    } else {
                        // Add new student record
                        studentsArray.push(attendanceRecord);
                    }

                    // Sort students by roll number
                    studentsArray.sort((a, b) => 
                        a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true })
                    );
                }
            })
            .addCase(createAttendance.rejected, (state, action) => {
                state.isLoading = false;
                console.error('Create attendance failed:', action.payload);
            })

            // Update Attendance
            .addCase(updateAttendance.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateAttendance.fulfilled, (state, action) => {
                state.isLoading = false;

                const updatedAttendance = action.payload.data;
                const attendanceId = updatedAttendance._id;
                const subjectId = updatedAttendance.subjectId?._id || updatedAttendance.subjectId;
                const scheduleId = updatedAttendance.scheduleId;
                const dateKey = new Date(updatedAttendance.date).toISOString().split('T')[0];

                for (const subject of state.subjectsWithAttendance) {
                    if (subject.id === subjectId) {
                        if (subject.attendance?.[dateKey]?.[scheduleId]?.students) {
                            const studentIndex = subject.attendance[dateKey][scheduleId].students.findIndex(
                                s => s.id === attendanceId
                            );

                            if (studentIndex !== -1) {
                                subject.attendance[dateKey][scheduleId].students[studentIndex] = {
                                    ...subject.attendance[dateKey][scheduleId].students[studentIndex],
                                    studentName: updatedAttendance.studentName,
                                    rollNo: updatedAttendance.rollNo,
                                    discipline: updatedAttendance.discipline,
                                    time: updatedAttendance.time,
                                };
                            }
                        }
                        break;
                    }
                }
            })
            .addCase(updateAttendance.rejected, (state, action) => {
                state.isLoading = false;
                console.error('Update attendance failed:', action.payload);
            })

            // Delete Attendance
            .addCase(deleteAttendance.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteAttendance.fulfilled, (state, action) => {
                state.isLoading = false;

                const deletedId = action.payload.deletedId;

                for (const subject of state.subjectsWithAttendance) {
                    if (subject.attendance) {
                        for (const dateKey in subject.attendance) {
                            for (const scheduleId in subject.attendance[dateKey]) {
                                // Filter out the deleted attendance record
                                subject.attendance[dateKey][scheduleId].students = 
                                    subject.attendance[dateKey][scheduleId].students.filter(
                                        s => s.id !== deletedId
                                    );

                                // If no students left in this schedule, remove the schedule
                                if (subject.attendance[dateKey][scheduleId].students.length === 0) {
                                    delete subject.attendance[dateKey][scheduleId];
                                }
                            }

                            // If no schedules left for this date, remove the date
                            if (Object.keys(subject.attendance[dateKey]).length === 0) {
                                delete subject.attendance[dateKey];
                            }
                        }
                    }
                }
            })
            .addCase(deleteAttendance.rejected, (state, action) => {
                state.isLoading = false;
                console.error('Delete attendance failed:', action.payload);
            });
    },
});

export const {
    clearAttendance,
} = attendanceSlicer.actions;

export default attendanceSlicer.reducer;