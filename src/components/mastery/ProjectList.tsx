import { GanttChart } from '@/components/mastery/GanttChart';
import { MilestoneDetailSheet } from '@/components/mastery/MilestoneDetailSheet';
import { Milestone, Project, useTaskStore } from '@/store/useTaskStore';
import { addDays, format, subDays } from 'date-fns';
import { useState } from 'react';
import { Pressable, Text, TextInput, useColorScheme, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PALETTE = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

// ─── Milestone Add Form ───────────────────────────────────────────────────────

function MilestoneAddForm({
  projectId, projectColor, onDone,
}: { projectId: string; projectColor: string; onDone: () => void }) {
  const isDark = useColorScheme() === 'dark';
  const addMilestone = useTaskStore((s) => s.addMilestone);
  const defaultEnd = addDays(new Date(), 7);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(subDays(defaultEnd, 3));
  const [endDate, setEndDate] = useState(defaultEnd);

  const shiftDate = (type: 'start' | 'end', delta: number) => {
    if (type === 'start') setStartDate((d) => addDays(d, delta));
    else setEndDate((d) => addDays(d, delta));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    addMilestone({ title: title.trim(), startDate: startDate.toISOString(), date: endDate.toISOString(), projectId });
    onDone();
  };

  const border = isDark ? '#374151' : '#E5E7EB';
  const sub = isDark ? '#9CA3AF' : '#6B7280';
  const text = isDark ? '#FFFFFF' : '#111827';

  return (
    <View style={{ backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: border, marginTop: 10 }}>
      <TextInput
        value={title} onChangeText={setTitle} placeholder="Milestone title..."
        placeholderTextColor={sub} autoFocus onSubmitEditing={handleSave}
        style={{ fontSize: 14, fontWeight: '700', color: text, backgroundColor: isDark ? '#111827' : '#FFFFFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: border, marginBottom: 12 }}
      />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {(['start', 'end'] as const).map((type) => {
          const d = type === 'start' ? startDate : endDate;
          return (
            <View key={type} style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                {type === 'start' ? 'Start' : 'Due'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#111827' : '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: border, overflow: 'hidden' }}>
                <Pressable onPress={() => shiftDate(type, -1)} style={{ padding: 8 }}>
                  <Feather name="minus" size={14} color={sub} />
                </Pressable>
                <Text style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: text }}>{format(d, 'MMM d')}</Text>
                <Pressable onPress={() => shiftDate(type, 1)} style={{ padding: 8 }}>
                  <Feather name="plus" size={14} color={type === 'end' ? projectColor : sub} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable onPress={onDone} style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: border }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: sub }}>Cancel</Text>
        </Pressable>
        <Pressable onPress={handleSave} style={{ flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: projectColor, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>Add Milestone</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, milestones }: { project: Project; milestones: Milestone[] }) {
  const isDark = useColorScheme() === 'dark';
  const toggleMilestone = useTaskStore((s) => s.toggleMilestone);
  const deleteMilestone = useTaskStore((s) => s.deleteMilestone);
  const updateProject = useTaskStore((s) => s.updateProject);
  const deleteProject = useTaskStore((s) => s.deleteProject);
  const allTasks = useTaskStore((s) => s.tasks);
  const toggleTask = useTaskStore((s) => s.toggleTask);

  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());

  // Edit-mode local state (only committed on Save)
  const [editName, setEditName] = useState(project.name);
  const [editColor, setEditColor] = useState(project.color);

  const enterEdit = () => {
    setEditName(project.name);
    setEditColor(project.color);
    setIsEditMode(true);
    setIsAddingMilestone(false);
  };

  const saveEdit = () => {
    if (editName.trim()) updateProject(project.id, { name: editName.trim(), color: editColor });
    setIsEditMode(false);
  };

  const cancelEdit = () => setIsEditMode(false);

  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;
  const border = isDark ? '#1F2937' : '#F3F4F6';
  const sub = isDark ? '#6B7280' : '#9CA3AF';
  const text = isDark ? '#FFFFFF' : '#111827';
  const cardBg = isDark ? '#111827' : '#FFFFFF';
  const activeColor = isEditMode ? editColor : project.color;

  return (
    <>
      <View style={{ backgroundColor: cardBg, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: isEditMode ? activeColor + '60' : border, marginBottom: 16 }}>

        {/* ── HEADER ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
          {/* Color dot */}
          <View style={{ width: 12, height: 12, borderRadius: 99, backgroundColor: activeColor }} />

          {/* Name — TextInput in edit mode, Text in normal mode */}
          {isEditMode ? (
            <TextInput
              value={editName} onChangeText={setEditName} autoFocus
              style={{ flex: 1, fontSize: 17, fontWeight: '900', color: text, borderBottomWidth: 1.5, borderBottomColor: activeColor, paddingBottom: 2 }}
              onSubmitEditing={saveEdit}
            />
          ) : (
            <Text numberOfLines={1} style={{ flex: 1, fontSize: 17, fontWeight: '900', color: text }}>
              {project.name}
            </Text>
          )}

          {/* Right actions */}
          {isEditMode ? (
            // Edit mode: OK button
            <Pressable
              onPress={saveEdit}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, backgroundColor: activeColor }}
            >
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF' }}>OK</Text>
            </Pressable>
          ) : (
            // Normal mode: count + gantt toggle + edit button
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: sub }}>{completedCount}/{milestones.length}</Text>
              <Pressable
                onPress={() => setViewMode(viewMode === 'list' ? 'gantt' : 'list')}
                style={{ width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: viewMode === 'gantt' ? project.color + '20' : isDark ? '#1F2937' : '#F9FAFB', borderWidth: 1, borderColor: viewMode === 'gantt' ? project.color + '60' : border }}
              >
                <Feather name={viewMode === 'gantt' ? 'list' : 'bar-chart-2'} size={14} color={viewMode === 'gantt' ? project.color : sub} />
              </Pressable>
              <Pressable
                onPress={enterEdit}
                style={{ width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderWidth: 1, borderColor: border }}
              >
                <Feather name="edit-2" size={14} color={sub} />
              </Pressable>
            </View>
          )}
        </View>

        {/* ── COLOR PICKER (edit mode only) ── */}
        {isEditMode && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {PALETTE.map((c) => (
              <Pressable
                key={c} onPress={() => setEditColor(c)}
                style={{ width: 26, height: 26, borderRadius: 99, backgroundColor: c, alignItems: 'center', justifyContent: 'center', borderWidth: editColor === c ? 3 : 0, borderColor: isDark ? '#FFFFFF' : '#FFFFFF' }}
              >
                {editColor === c && <Feather name="check" size={11} color="#FFFFFF" />}
              </Pressable>
            ))}
          </View>
        )}

        {/* ── PROGRESS BAR ── */}
        <View style={{ height: 4, borderRadius: 99, backgroundColor: isDark ? '#1F2937' : '#F3F4F6', marginBottom: 16, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${progress}%`, borderRadius: 99, backgroundColor: activeColor }} />
        </View>

        {/* ── LIST VIEW ── */}
        {viewMode === 'list' && (
          <View style={{ gap: 0, marginBottom: 4 }}>
            {milestones.map((milestone) => {
              const endDate = new Date(milestone.date);
              const isOverdue = !milestone.isCompleted && new Date() > endDate;
              const linkedTasks = allTasks.filter((t) => t.milestoneId === milestone.id);
              const hasLinkedTasks = linkedTasks.length > 0;
              const isExpanded = expandedMilestones.has(milestone.id);

              const toggleExpand = () => {
                setExpandedMilestones((prev) => {
                  const next = new Set(prev);
                  if (next.has(milestone.id)) next.delete(milestone.id);
                  else next.add(milestone.id);
                  return next;
                });
              };

              return (
                <View key={milestone.id} style={{ marginBottom: 6 }}>
                  {/* ── Milestone Row ── */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Checkbox */}
                    <Pressable
                      onPress={() => !isEditMode && toggleMilestone(milestone.id)}
                      style={{ marginRight: 10 }}
                    >
                      <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: milestone.isCompleted ? project.color : (isDark ? '#374151' : '#D1D5DB'), backgroundColor: milestone.isCompleted ? project.color : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                        {milestone.isCompleted && <Feather name="check" size={11} color="#FFFFFF" />}
                      </View>
                    </Pressable>

                    {/* Title — tappable to expand in normal mode / edit in edit mode */}
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={() => {
                        if (isEditMode) setSelectedMilestone(milestone);
                        else if (hasLinkedTasks) toggleExpand();
                      }}
                    >
                      <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '600', color: milestone.isCompleted ? (isDark ? '#4B5563' : '#9CA3AF') : (isDark ? '#E5E7EB' : '#1F2937'), textDecorationLine: milestone.isCompleted ? 'line-through' : 'none' }}>
                        {milestone.title}
                      </Text>
                    </Pressable>

                    {/* Right side controls */}
                    {isEditMode ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Pressable onPress={() => setSelectedMilestone(milestone)}>
                          <Feather name="edit-2" size={14} color={activeColor} />
                        </Pressable>
                        <Pressable onPress={() => deleteMilestone(milestone.id)}>
                          <Feather name="trash-2" size={14} color="#EF4444" />
                        </Pressable>
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: isOverdue ? '#EF4444' : sub }}>
                          {format(endDate, 'MMM d')}
                        </Text>
                        {/* Chevron only when there are linked tasks */}
                        {hasLinkedTasks && (
                          <Pressable onPress={toggleExpand} hitSlop={8}>
                            <Feather
                              name={isExpanded ? 'chevron-up' : 'chevron-down'}
                              size={14}
                              color={project.color}
                            />
                          </Pressable>
                        )}
                      </View>
                    )}
                  </View>

                  {/* ── Subtasks (collapsed by default, expand on toggle) ── */}
                  {isExpanded && hasLinkedTasks && (
                    <View style={{ marginTop: 6, marginLeft: 30, gap: 5 }}>
                      {linkedTasks.map((task) => (
                        <Pressable
                          key={task.id}
                          onPress={() => {
                            // Toggle this task
                            toggleTask(task.id);
                            // Compute next completion state
                            const willBeCompleted = !task.completed;
                            const otherTasks = linkedTasks.filter((t) => t.id !== task.id);
                            const allWillBeCompleted = willBeCompleted && otherTasks.every((t) => t.completed);
                            // Auto-complete milestone when all subtasks done
                            if (allWillBeCompleted && !milestone.isCompleted) {
                              toggleMilestone(milestone.id);
                            }
                            // Auto-uncheck milestone when a subtask is unchecked
                            if (!willBeCompleted && milestone.isCompleted) {
                              toggleMilestone(milestone.id);
                            }
                          }}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: isDark ? '#1F2937' : project.color + '10', borderRadius: 10, borderLeftWidth: 2, borderLeftColor: project.color + '60' }}
                        >
                          {/* Mini checkbox */}
                          <View style={{ width: 15, height: 15, borderRadius: 4, borderWidth: 1.5, borderColor: task.completed ? project.color : (isDark ? '#4B5563' : '#D1D5DB'), backgroundColor: task.completed ? project.color : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                            {task.completed && <Feather name="check" size={9} color="#FFFFFF" />}
                          </View>
                          <Text
                            numberOfLines={1}
                            style={{ flex: 1, fontSize: 12, fontWeight: '600', color: task.completed ? (isDark ? '#4B5563' : '#9CA3AF') : (isDark ? '#D1D5DB' : '#374151'), textDecorationLine: task.completed ? 'line-through' : 'none' }}
                          >
                            {task.title}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ── GANTT VIEW ── */}
        {viewMode === 'gantt' && (
          <GanttChart project={project} milestones={milestones} onMilestonePress={(m) => setSelectedMilestone(m)} />
        )}

        {/* ── EDIT MODE: delete project + add milestone ── */}
        {isEditMode && (
          <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: border, gap: 8 }}>
            <Pressable
              onPress={() => setIsAddingMilestone(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.7 }}
            >
              <Feather name="plus" size={14} color={activeColor} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: activeColor }}>Add Milestone</Text>
            </Pressable>
            <Pressable
              onPress={() => deleteProject(project.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.7 }}
            >
              <Feather name="trash-2" size={14} color="#EF4444" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#EF4444' }}>Delete Project</Text>
            </Pressable>
            <Pressable onPress={cancelEdit} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.5 }}>
              <Feather name="x" size={14} color={sub} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: sub }}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {/* ── NORMAL MODE: add milestone ── */}
        {!isEditMode && (
          isAddingMilestone ? (
            <MilestoneAddForm projectId={project.id} projectColor={project.color} onDone={() => setIsAddingMilestone(false)} />
          ) : (
            <Pressable
              onPress={() => setIsAddingMilestone(true)}
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: border, gap: 6, opacity: 0.55 }}
            >
              <Feather name="plus" size={14} color={sub} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: sub }}>Add Milestone</Text>
            </Pressable>
          )
        )}

        {/* ── Add Milestone Form in edit mode ── */}
        {isEditMode && isAddingMilestone && (
          <MilestoneAddForm projectId={project.id} projectColor={activeColor} onDone={() => setIsAddingMilestone(false)} />
        )}
      </View>

      {/* Milestone Detail/Edit Bottom Sheet */}
      <MilestoneDetailSheet
        milestone={selectedMilestone}
        projectColor={project.color}
        onClose={() => setSelectedMilestone(null)}
      />
    </>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function ProjectList() {
  const isDark = useColorScheme() === 'dark';
  const projects = useTaskStore((s) => s.projects);
  const milestones = useTaskStore((s) => s.milestones);
  const addProject = useTaskStore((s) => s.addProject);

  const [newProjectName, setNewProjectName] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);

  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    addProject(newProjectName.trim(), selectedColor);
    setNewProjectName('');
    setSelectedColor(PALETTE[0]);
    setIsAddingProject(false);
  };

  const border = isDark ? '#1F2937' : '#E5E7EB';
  const sub = isDark ? '#4B5563' : '#9CA3AF';

  return (
    <View style={{ gap: 0 }}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          milestones={milestones.filter((m) => m.projectId === project.id)}
        />
      ))}

      {isAddingProject ? (
        <View style={{ backgroundColor: isDark ? '#111827' : '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: border, marginTop: 4 }}>
          <TextInput
            value={newProjectName} onChangeText={setNewProjectName}
            placeholder="Project name..." placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            autoFocus onSubmitEditing={handleAddProject}
            style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#FFFFFF' : '#111827', backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: border, marginBottom: 14 }}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {PALETTE.map((c) => (
              <Pressable key={c} onPress={() => setSelectedColor(c)}
                style={{ width: 28, height: 28, borderRadius: 99, backgroundColor: c, alignItems: 'center', justifyContent: 'center', borderWidth: selectedColor === c ? 3 : 0, borderColor: '#FFFFFF' }}>
                {selectedColor === c && <Feather name="check" size={12} color="#FFFFFF" />}
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={() => setIsAddingProject(false)} style={{ paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12, borderWidth: 1, borderColor: border }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#9CA3AF' : '#6B7280' }}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleAddProject} style={{ flex: 1, paddingVertical: 11, borderRadius: 12, backgroundColor: selectedColor, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Create Project</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => setIsAddingProject(true)}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderWidth: 2, borderStyle: 'dashed', borderColor: border, borderRadius: 22, marginTop: 4, opacity: pressed ? 0.6 : 1, gap: 8 })}
        >
          <Feather name="folder-plus" size={18} color={sub} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: sub }}>New Project</Text>
        </Pressable>
      )}
    </View>
  );
}
