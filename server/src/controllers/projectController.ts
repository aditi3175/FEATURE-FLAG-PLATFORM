import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database';
import { logAudit, computeChanges } from '../services/auditService';

/**
 * Generate a cryptographically secure API key
 */
function generateApiKey(prefix: string = 'ff_prod_'): string {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}${randomBytes}`;
}

/**
 * Create a new project
 * POST /api/projects
 */
export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const apiKey = generateApiKey();

    const project = await prisma.project.create({
      data: {
        name,
        apiKey,
        userId: req.user.userId,
      },
    });

    // Audit log
    logAudit({
      projectId: project.id,
      userId: req.user.userId,
      action: 'project.created',
      entityType: 'project',
      entityId: project.id,
      entityName: project.name,
      changes: { after: { name: project.name } },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

/**
 * Get all projects for authenticated user
 * GET /api/projects
 */
export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const projects = await prisma.project.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { flags: true },
        },
      },
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

/**
 * Get a single project by ID
 * GET /api/projects/:projectId
 */
export async function getProjectById(req: Request, res: Response): Promise<void> {
  try {
    const projectId = req.params.projectId as string;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        flags: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Verify project belongs to user
    if (project.userId !== req.user.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

/**
 * Update a project
 * PATCH /api/projects/:projectId
 */
export async function updateProject(req: Request, res: Response): Promise<void> {
  try {
    const projectId = req.params.projectId as string;
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Verify project exists and belongs to user
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (existingProject.userId !== req.user.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { name },
      include: {
        _count: {
          select: { flags: true },
        },
      },
    });

    // Audit log
    logAudit({
      projectId: updatedProject.id,
      userId: req.user.userId,
      action: 'project.updated',
      entityType: 'project',
      entityId: updatedProject.id,
      entityName: updatedProject.name,
      changes: { name: { from: existingProject.name, to: updatedProject.name } },
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
}

/**
 * Delete a project
 * DELETE /api/projects/:projectId
 */
export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const projectId = req.params.projectId as string;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Verify project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.userId !== req.user.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Audit log — must log before delete (cascade removes related data)
    logAudit({
      projectId: project.id,
      userId: req.user.userId,
      action: 'project.deleted',
      entityType: 'project',
      entityId: project.id,
      entityName: project.name,
      changes: { before: { name: project.name } },
    });

    await prisma.project.delete({
      where: { id: projectId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

/**
 * Delete all projects for authenticated user
 * DELETE /api/projects
 */
export async function deleteAllProjects(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Delete all projects belonging to the user
    // Flags will be deleted automatically due to cascade delete in schema
    await prisma.project.deleteMany({
      where: { userId: req.user.userId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting all projects:', error);
    res.status(500).json({ error: 'Failed to delete all projects' });
  }
}
