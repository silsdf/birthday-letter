export const GAME_PROGRESS_KEY = "pixel_room_progress";

export const TASKS = {
  bedZone: { id: "bed", url: "bed_cleaning_demo.html?from=game", prompt: "清洁床铺" },
  deskZone: { id: "desk", url: "desk_cleaning_demo.html?from=game&v=13", prompt: "整理书桌" },
  luggageZone: { id: "luggage", url: "luggage_packing_demo.html?from=game", prompt: "整理行李" }
};

export function loadProgress() {
  try {
    return { completed: {}, stickerAwarded: false, ...JSON.parse(localStorage.getItem(GAME_PROGRESS_KEY)) };
  } catch {
    return { completed: {}, stickerAwarded: false };
  }
}

export function saveProgress(progress) {
  localStorage.setItem(GAME_PROGRESS_KEY, JSON.stringify(progress));
}

export function resetProgress() {
  saveProgress({ completed: {}, stickerAwarded: false });
}

export function savePlayerPosition(position) {
  const progress = loadProgress();
  progress.playerPosition = position;
  saveProgress(progress);
}

export function completeTask(taskId) {
  const progress = loadProgress();
  progress.completed[taskId] = true;
  saveProgress(progress);
}

export function isTaskComplete(zoneId) {
  const task = TASKS[zoneId];
  return task ? Boolean(loadProgress().completed[task.id]) : false;
}

export function allTasksComplete() {
  const progress = loadProgress();
  return ["bed", "desk", "luggage"].every(id => progress.completed[id]);
}
