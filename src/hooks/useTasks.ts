import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DerivedTask, Metrics, Task } from '@/types';
import {
  computeAverageROI,
  computePerformanceGrade,
  computeRevenuePerHour,
  computeTimeEfficiency,
  computeTotalRevenue,
  withDerived,
} from '@/utils/logic';
import { generateSalesTasks } from '@/utils/seed';

interface UseTasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  derivedSorted: DerivedTask[];
  metrics: Metrics;
  lastDeleted: Task | null;
  addTask: (task: Omit<Task, 'id'> & { id?: string }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  undoDelete: (restore?: boolean) => void;
}

const INITIAL_METRICS: Metrics = {
  totalRevenue: 0,
  totalTimeTaken: 0,
  timeEfficiencyPct: 0,
  revenuePerHour: 0,
  averageROI: 0,
  performanceGrade: 'Needs Improvement',
};

export function useTasks(): UseTasksState {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDeleted, setLastDeleted] = useState<Task | null>(null);
  const fetchedRef = useRef(false);

  function normalizeTasks(input: any[]): Task[] {
    const now = Date.now();
    return (Array.isArray(input) ? input : []).map((t, idx) => {
      const created = t.createdAt ? new Date(t.createdAt) : new Date(now - (idx + 1) * 24 * 3600 * 1000);
      const completed = t.completedAt || (t.status === 'Done' ? new Date(created.getTime() + 24 * 3600 * 1000).toISOString() : undefined);
      return {
        id: t.id ?? crypto.randomUUID?.(),
        title: t.title ?? 'Untitled Task',
        revenue: Number(t.revenue) > 0 ? Number(t.revenue) : 0,
        timeTaken: Number(t.timeTaken) > 0 ? Number(t.timeTaken) : 1,
        priority: t.priority ?? 'Low',
        status: t.status ?? 'Todo',
        notes: t.notes ?? '',
        createdAt: created.toISOString(),
        completedAt: completed,
      } as Task;
    });
  }

  // BUG 1: Fetch once
  useEffect(() => {
    if (fetchedRef.current) return;
    let isMounted = true;

    async function load() {
      try {
        const res = await fetch('/tasks.json');
        const data = res.ok ? (await res.json()) as any[] : [];
        let finalData = normalizeTasks(data);
        if (finalData.length === 0) finalData = generateSalesTasks(50);
        if (isMounted) setTasks(finalData);
      } catch (e: any) {
        if (isMounted) setError(e?.message ?? 'Failed to load tasks');
      } finally {
        if (isMounted) {
          setLoading(false);
          fetchedRef.current = true;
        }
      }
    }

    load();
    return () => { isMounted = false; };
  }, []);

  // BUG 3: Stable derived sorting with tie-breaker (title)
  const derivedSorted = useMemo<DerivedTask[]>(() => {
    const withRoi = tasks.map(withDerived);
    return withRoi.sort((a, b) => {
      const roiA = a.roi ?? 0;
      const roiB = b.roi ?? 0;
      if (roiB !== roiA) return roiB - roiA; // ROI descending
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      if (priorityOrder[b.priority] !== priorityOrder[a.priority]) return priorityOrder[b.priority] - priorityOrder[a.priority];
      return a.title.localeCompare(b.title); // Stable tie-breaker
    });
  }, [tasks]);

  // Metrics calculation
  const metrics = useMemo<Metrics>(() => {
    if (tasks.length === 0) return INITIAL_METRICS;
    const validTasks = tasks.filter(t => !isNaN(t.revenue) && t.timeTaken > 0);
    if (validTasks.length === 0) return INITIAL_METRICS;
    const totalRevenue = computeTotalRevenue(validTasks);
    const totalTimeTaken = validTasks.reduce((s, t) => s + t.timeTaken, 0);
    const timeEfficiencyPct = computeTimeEfficiency(validTasks);
    const revenuePerHour = computeRevenuePerHour(validTasks);
    const averageROI = computeAverageROI(validTasks);
    const performanceGrade = computePerformanceGrade(averageROI);
    return { totalRevenue, totalTimeTaken, timeEfficiencyPct, revenuePerHour, averageROI, performanceGrade };
  }, [tasks]);

  const addTask = useCallback((task: Omit<Task, 'id'> & { id?: string }) => {
    setTasks(prev => {
      const id = task.id ?? crypto.randomUUID?.();
      const timeTaken = task.timeTaken <= 0 ? 1 : task.timeTaken;
      const createdAt = new Date().toISOString();
      const completedAt = task.status === 'Done' ? createdAt : undefined;
      return [...prev, { ...task, id, timeTaken, createdAt, completedAt }];
    });
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const merged = { ...t, ...patch };
      if (t.status !== 'Done' && merged.status === 'Done' && !merged.completedAt) merged.completedAt = new Date().toISOString();
      if (merged.timeTaken <= 0) merged.timeTaken = 1;
      return merged;
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const target = prev.find(t => t.id === id) || null;
      setLastDeleted(target);
      return prev.filter(t => t.id !== id);
    });
  }, []);

  // BUG 2: Undo fixes
  const undoDelete = useCallback((restore: boolean = true) => {
    if (restore && lastDeleted) setTasks(prev => [...prev, lastDeleted]);
    setLastDeleted(null);
  }, [lastDeleted]);

  return { tasks, loading, error, derivedSorted, metrics, lastDeleted, addTask, updateTask, deleteTask, undoDelete };
}
