import { Request, NextFunction, Response } from "express";
import { decryptText, encryptText } from "../utils/crypto";
import { Task } from "../models/task.model";
import { isValidObjectId } from "mongoose";

const VALID_STATUSES = ["todo", "in-progress", "done"];

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not Authenticated" });
    }

    const { title, description, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status value. Must be one of: todo, in-progress, done" });
    }

    const encDescription = encryptText(description);

    const task = await Task.create({
      title,
      description: encDescription,
      status: status || "todo",
      userId: req.user.id,
    });

    return res.status(201).json({
      id: task._id,
      title: task.title,
      description,
      status: task.status,
      createdAt: task.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not Authenticated" });
    }

    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt((req.query.limit as string) || "10", 10))
    );
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    if (status && !VALID_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status value. Must be one of: todo, in-progress, done" });
    }

    const filter: any = { userId: req.user.id };
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ]);

    const data = tasks.map((t) => ({
      id: t._id,
      title: t.title,
      description: decryptText(t.description),
      status: t.status,
      createdAt: t.createdAt,
    }));

    return res.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not Authenticated" });
    }

    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOne({ _id: id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json({
      id: task._id,
      title: task.title,
      description: decryptText(task.description),
      status: task.status,
      createdAt: task.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not Authenticated" });
    }

    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const { title, description, status } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status value. Must be one of: todo, in-progress, done" });
    }

    const task = await Task.findOne({ _id: id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (title) task.title = title;
    if (description) task.description = encryptText(description);
    if (status) task.status = status;

    await task.save();

    return res.json({
      id: task._id,
      title: task.title,
      description: decryptText(task.description),
      status: task.status,
      createdAt: task.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};