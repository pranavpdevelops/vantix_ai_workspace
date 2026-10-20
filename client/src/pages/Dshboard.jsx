import {
  FolderKanban,
  CheckCircle2,
  Clock3,
  CircleAlert,
  ArrowUpRight,
  Plus,
  Sparkles,
  CalendarDays,
} from "lucide-react";

import { useAuth } from "../context/authcontext";
import Sidebar from "../components/SideBar";

const stats = [
  {
    title: "Total Projects",
    value: "12",
    detail: "+2 this month",
    icon: FolderKanban,
    color: "purple",
  },
  {
    title: "Completed Tasks",
    value: "48",
    detail: "Across all projects",
    icon: CheckCircle2,
    color: "teal",
  },
  {
    title: "In Progress",
    value: "08",
    detail: "Keep the momentum",
    icon: Clock3,
    color: "pink",
  },
  {
    title: "Overdue Tasks",
    value: "03",
    detail: "Need your attention",
    icon: CircleAlert,
    color: "gold",
  },
];

const projects = [
  {
    name: "Website Redesign",
    description: "Modernizing the company website",
    progress: 75,
    tasks: "9/12 tasks",
    color: "purple",
  },
  {
    name: "Mobile Application",
    description: "Building the mobile experience",
    progress: 45,
    tasks: "5/11 tasks",
    color: "teal",
  },
  {
    name: "Marketing Campaign",
    description: "Planning the next campaign",
    progress: 90,
    tasks: "9/10 tasks",
    color: "pink",
  },
];

const tasks = [
  {
    title: "Design the login page",
    project: "Website Redesign",
    priority: "High",
    status: "In Progress",
  },
  {
    title: "Create API endpoints",
    project: "Mobile Application",
    priority: "Medium",
    status: "Todo",
  },
  {
    title: "Review dashboard UI",
    project: "Website Redesign",
    priority: "Low",
    status: "Completed",
  },
  {
    title: "Prepare campaign assets",
    project: "Marketing Campaign",
    priority: "High",
    status: "In Progress",
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h2>Overview</h2>
          </div>

          <button
            className="create-button"
            onClick={() => {
              window.location.href = "/projects";
            }}
          >
            <Plus size={18} />
            New Project
          </button>
        </header>

        <section className="welcome-panel">
          <div className="welcome-content">
            <div className="welcome-badge">
              <Sparkles size={14} />
              YOUR PRODUCTIVITY SPACE
            </div>

            <h1>
              Welcome back,{" "}
              <span>{user?.name?.split(" ")[0] || "there"}</span>
            </h1>

            <p>
              Turn your ideas into progress. Here's what's happening
              with your workspace today.
            </p>
          </div>

          <div className="welcome-decoration">
            <div className="decoration-orbit orbit-one" />
            <div className="decoration-orbit orbit-two" />
            <div className="decoration-core">
              <Sparkles size={34} />
            </div>
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article className="stat-card" key={stat.title}>
                <div className="stat-top">
                  <div className={`stat-icon ${stat.color}`}>
                    <Icon size={21} />
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="stat-arrow"
                  />
                </div>

                <p>{stat.title}</p>
                <h2>{stat.value}</h2>
                <span className="stat-detail">{stat.detail}</span>
              </article>
            );
          })}
        </section>

        <section className="content-grid">
          <div className="panel projects-panel">
            <div className="panel-header">
              <div>
                <h2>Active Projects</h2>
                <p>Track your team's progress</p>
              </div>

              <a href="/projects" className="text-link">
                View all
              </a>
            </div>

            <div className="project-list">
              {projects.map((project) => (
                <article className="project-item" key={project.name}>
                  <div className="project-heading">
                    <div className={`project-symbol ${project.color}`}>
                      <FolderKanban size={20} />
                    </div>

                    <div className="project-info">
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                    </div>
                  </div>

                  <div className="progress-details">
                    <span>{project.tasks}</span>
                    <strong>{project.progress}%</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress-fill ${project.color}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel activity-panel">
            <div className="panel-header">
              <div>
                <h2>Quick Insights</h2>
                <p>Your workspace at a glance</p>
              </div>

              <Sparkles size={20} className="insight-icon" />
            </div>

            <div className="insight-card">
              <div className="insight-icon-box">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <strong>Keep it going!</strong>
                <p>
                  Complete your remaining tasks to reach your goals.
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon-box teal">
                <CalendarDays size={21} />
              </div>

              <div>
                <strong>Stay organized</strong>
                <p>
                  Review your upcoming deadlines and prioritize work.
                </p>
              </div>
            </div>

            <button
              className="ai-promo"
              onClick={() => {
                window.location.href = "/ai";
              }}
            >
              <div>
                <Sparkles size={20} />
                <strong>Try TaskForge AI</strong>
              </div>

              <p>Get help planning your next project.</p>

              <span>
                Explore AI Assistant <ArrowUpRight size={16} />
              </span>
            </button>
          </div>
        </section>

        <section className="panel tasks-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Tasks</h2>
              <p>A quick look at your task list</p>
            </div>

            <a href="/kanban" className="text-link">
              Open Kanban
            </a>
          </div>

          <div className="task-table-wrap">
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task) => (
                  <tr key={task.title}>
                    <td>
                      <span className="task-name">{task.title}</span>
                    </td>

                    <td>
                      <span className="task-project">{task.project}</span>
                    </td>

                    <td>
                      <span
                        className={`priority-badge ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${task.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="dashboard-footer">
          TaskForge AI <span>·</span> Build better, together.
        </footer>
      </main>
    </div>
  );
}