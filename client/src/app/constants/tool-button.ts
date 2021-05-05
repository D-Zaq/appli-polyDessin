import { SidebarButton } from '@app/classes/sidebar-button';
import { ToolName } from '@app/constants/tool-name';

export const toolButtons: SidebarButton[] = [
    { tooltip: ToolName.Pencil, shortcut: '[C]' }, // 0
    { tooltip: ToolName.Spraypaint, shortcut: '[A]' }, // 1
    { tooltip: ToolName.Rectangle, shortcut: '[1]' }, // 2
    { tooltip: ToolName.Ellipse, shortcut: '[2]' }, // 3
    { tooltip: ToolName.Polygone, shortcut: '[3]' }, // 4
    { tooltip: ToolName.Line, shortcut: '[L]' }, // 5
    { tooltip: ToolName.Text, shortcut: '[T]' }, // 6
    { tooltip: ToolName.PaintBucket, shortcut: '[B]' }, // 7
    { tooltip: ToolName.Eraser, shortcut: '[E]' }, // 8
    { tooltip: ToolName.Stamp, shortcut: '[D]' }, // 9
    { tooltip: ToolName.Pipette, shortcut: '[I]' }, // 10
    { tooltip: ToolName.RectangleSelection, shortcut: '[R]' }, // 11
    { tooltip: ToolName.EllipseSelection, shortcut: '[S]' }, // 12
    { tooltip: ToolName.LassoPolygonal, shortcut: '[V]' }, // 13
    { tooltip: ToolName.ToggleGrid, shortcut: '[G]' }, // 14
    { tooltip: ToolName.Magnetism, shortcut: '[M]' }, // 15
    { tooltip: ToolName.newDrawing, shortcut: '[Ctrl-O]' }, // 16
    { tooltip: ToolName.SaveDrawing, shortcut: '[Ctrl-S]' }, // 17
    { tooltip: ToolName.SeeDrawingCaroussel, shortcut: '[Ctrl-G]' }, // 18
    { tooltip: ToolName.ExportDrawing, shortcut: '[Ctrl-E]' }, // 19
    { tooltip: ToolName.Cancel, shortcut: '[Ctrl-Z]' }, // 20
    { tooltip: ToolName.Redo, shortcut: '[Ctrl-SHift-Z]' }, // 21
    { tooltip: ToolName.Copy, shortcut: '[Ctrl-C]' }, // 22
    { tooltip: ToolName.Cut, shortcut: '[Ctrl-X]' }, // 23
    { tooltip: ToolName.Paste, shortcut: '[Ctrl-Shift-V]' }, // 24
    { tooltip: ToolName.Homepage, shortcut: '' }, // 25
    { tooltip: ToolName.ToggleGrid, shortcut: '[G]' }, // 26
    { tooltip: ToolName.Magnetism, shortcut: '[M]' }, // 27
];
