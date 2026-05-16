import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ReviewState {
  activeJobs: Record<number, any>;
  selectedJobId: number | null;
}

const initialState: ReviewState = {
  activeJobs: {},
  selectedJobId: null,
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    updateJobProgress: (state, action: PayloadAction<{ jobId: number; progress: any }>) => {
      const { jobId, progress } = action.payload;
      state.activeJobs[jobId] = {
        ...(state.activeJobs[jobId] || {}),
        ...progress,
      };
    },
    setSelectedJob: (state, action: PayloadAction<number | null>) => {
      state.selectedJobId = action.payload;
    },
  },
});

export const { updateJobProgress, setSelectedJob } = reviewSlice.actions;
export default reviewSlice.reducer;
