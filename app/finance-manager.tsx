"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { LogOut, Plus, Trash2, Calendar, DollarSign, TrendingUp, Save, FileText, Loader2 } from "lucide-react"

interface FinanceEntry {
  id: string
  sheet_id?: string
  date: string
  overview: string
  amount: number
  work: string
}

interface FinanceSheet {
  id: string
  name: string
  month: string
  year: string
  entries: FinanceEntry[]
}

interface FinanceManagerProps {
  onLogout: () => void
  userPassword: string
}

export default function FinanceManager({ onLogout, userPassword }: FinanceManagerProps) {
  const [sheets, setSheets] = useState<FinanceSheet[]>([])
  const [currentSheet, setCurrentSheet] = useState<FinanceSheet | null>(null)
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [newSheetName, setNewSheetName] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "entry" | "sheet"
    id: string
    name?: string
  } | null>(null)

  const months = [
    { value: "01", label: "Tháng 1" },
    { value: "02", label: "Tháng 2" },
    { value: "03", label: "Tháng 3" },
    { value: "04", label: "Tháng 4" },
    { value: "05", label: "Tháng 5" },
    { value: "06", label: "Tháng 6" },
    { value: "07", label: "Tháng 7" },
    { value: "08", label: "Tháng 8" },
    { value: "09", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" },
  ]

  const years = ["2024", "2025", "2026", "2027", "2028"]

  useEffect(() => {
    loadSheets()
  }, [])

  const loadSheets = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sheets?password=${encodeURIComponent(userPassword)}`)
      if (response.ok) {
        const data = await response.json()
        setSheets(data)
        if (data.length > 0) {
          setCurrentSheet(data[0])
        }
      }
    } catch (error) {
      console.error("Error loading sheets:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (month: string, year: string) => {
    return new Date(Number.parseInt(year), Number.parseInt(month), 0).getDate()
  }

  const createSheet = async () => {
    if (!newSheetName || !selectedMonth || !selectedYear) return

    try {
      const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
      const entries: FinanceEntry[] = []

      for (let day = 1; day <= daysInMonth; day++) {
        entries.push({
          id: `temp-${day}`,
          date: `${day.toString().padStart(2, "0")}/${selectedMonth}/${selectedYear}`,
          overview: "",
          amount: 0,
          work: "",
        })
      }

      const response = await fetch("/api/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: userPassword,
          name: newSheetName,
          month: selectedMonth,
          year: selectedYear,
          entries,
        }),
      })

      if (response.ok) {
        await loadSheets()
        setIsCreateSheetOpen(false)
        setNewSheetName("")
        setSelectedMonth("")
        setSelectedYear("")
      }
    } catch (error) {
      console.error("Error creating sheet:", error)
    }
  }

  const updateEntry = async (entryId: string, field: keyof FinanceEntry, value: string | number) => {
    if (!currentSheet) return

    try {
      // Cập nhật local state ngay lập tức
      const updatedEntries = currentSheet.entries.map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry,
      )
      const updatedSheet = { ...currentSheet, entries: updatedEntries }
      setCurrentSheet(updatedSheet)
      setSheets(sheets.map((sheet) => (sheet.id === currentSheet.id ? updatedSheet : sheet)))

      // Cập nhật database
      const entry = updatedEntries.find((e) => e.id === entryId)
      if (entry) {
        await fetch("/api/entries", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: entryId,
            overview: entry.overview,
            amount: entry.amount,
            work: entry.work,
          }),
        })
      }
    } catch (error) {
      console.error("Error updating entry:", error)
    }
  }

  const addWorkEntry = async (date: string) => {
    if (!currentSheet) return

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sheet_id: currentSheet.id,
          date,
          overview: "",
          amount: 0,
          work: "",
        }),
      })

      if (response.ok) {
        await loadSheets()
      }
    } catch (error) {
      console.error("Error adding entry:", error)
    }
  }

  const deleteEntry = async (entryId: string) => {
    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadSheets()
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
    }
  }

  const deleteSheet = async (sheetId: string) => {
    try {
      const response = await fetch(`/api/sheets/${sheetId}?password=${encodeURIComponent(userPassword)}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadSheets()
      }
    } catch (error) {
      console.error("Error deleting sheet:", error)
    }
  }

  const getTotalAmount = () => {
    if (!currentSheet) return 0
    return currentSheet.entries.reduce((total, entry) => total + (entry.amount || 0), 0)
  }

  const groupEntriesByDate = () => {
    if (!currentSheet) return {}

    const grouped: { [key: string]: FinanceEntry[] } = {}
    currentSheet.entries.forEach((entry) => {
      if (!grouped[entry.date]) {
        grouped[entry.date] = []
      }
      grouped[entry.date].push(entry)
    })

    return grouped
  }

  const confirmDelete = (type: "entry" | "sheet", id: string, name?: string) => {
    setDeleteConfirm({ type, id, name })
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return

    if (deleteConfirm.type === "entry") {
      await deleteEntry(deleteConfirm.id)
    } else {
      await deleteSheet(deleteConfirm.id)
    }

    setDeleteConfirm(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm p-4"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <DollarSign className="w-8 h-8 text-green-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800">Quản Lý Tài Chính</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Dialog open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo Bảng Mới
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-gray-800">Tạo Bảng Tài Chính Mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700">Tên bảng</Label>
                    <Input
                      value={newSheetName}
                      onChange={(e) => setNewSheetName(e.target.value)}
                      placeholder="Ví dụ: Thu chi tháng 1"
                      className="bg-white border-gray-300 text-gray-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700">Tháng</Label>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder="Chọn tháng" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-700">Năm</Label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder="Chọn năm" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={createSheet} className="w-full bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Tạo Bảng
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={onLogout} variant="destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Đăng Xuất
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Sheet Tabs */}
        {sheets.length > 0 && (
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {sheets.map((sheet) => (
                <div key={sheet.id} className="flex items-center">
                  <Button
                    onClick={() => setCurrentSheet(sheet)}
                    variant={currentSheet?.id === sheet.id ? "default" : "outline"}
                    className="whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {sheet.name}
                  </Button>
                  <Button
                    onClick={() => confirmDelete("sheet", sheet.id, sheet.name)}
                    variant="ghost"
                    size="sm"
                    className="ml-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {currentSheet ? (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-white/95 backdrop-blur-lg border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                  Tổng Quan - {currentSheet.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-gray-600">Tháng</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {months.find((m) => m.value === currentSheet.month)?.label} {currentSheet.year}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Số Giao Dịch</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currentSheet.entries.filter((e) => e.work || e.amount).length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Tổng Cộng</p>
                    <p className="text-3xl font-bold text-green-600">{getTotalAmount().toLocaleString("vi-VN")} VNĐ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Finance Table */}
            <Card className="bg-white/95 backdrop-blur-lg border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                  Chi Tiết Giao Dịch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left p-3 text-gray-700 font-semibold">Ngày</th>
                        <th className="text-left p-3 text-gray-700 font-semibold">Tổng Quan</th>
                        <th className="text-left p-3 text-gray-700 font-semibold">Số Tiền (VNĐ)</th>
                        <th className="text-left p-3 text-gray-700 font-semibold">Công Việc</th>
                        <th className="text-left p-3 text-gray-700 font-semibold">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {Object.entries(groupEntriesByDate()).map(([date, entries]) =>
                          entries.map((entry, index) => (
                            <motion.tr
                              key={entry.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <td className="p-3 text-gray-800">{index === 0 ? date : ""}</td>
                              <td className="p-3">
                                <Input
                                  value={entry.overview}
                                  onChange={(e) => updateEntry(entry.id, "overview", e.target.value)}
                                  className="bg-white border-gray-300 text-gray-800 focus:border-blue-500"
                                  placeholder="Mô tả..."
                                />
                              </td>
                              <td className="p-3">
                                <Input
                                  type="number"
                                  value={entry.amount || ""}
                                  onChange={(e) =>
                                    updateEntry(entry.id, "amount", Number.parseFloat(e.target.value) || 0)
                                  }
                                  className="bg-white border-gray-300 text-gray-800 focus:border-blue-500"
                                  placeholder="0"
                                />
                              </td>
                              <td className="p-3">
                                <Input
                                  value={entry.work}
                                  onChange={(e) => updateEntry(entry.id, "work", e.target.value)}
                                  className="bg-white border-gray-300 text-gray-800 focus:border-blue-500"
                                  placeholder="Công việc..."
                                />
                              </td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  {index === entries.length - 1 && (
                                    <Button
                                      onClick={() => addWorkEntry(date)}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {entries.length > 1 && (
                                    <Button
                                      onClick={() => confirmDelete("entry", entry.id)}
                                      size="sm"
                                      variant="destructive"
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          )),
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <FileText className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có bảng tài chính nào</h2>
            <p className="text-gray-600 mb-6">Tạo bảng đầu tiên để bắt đầu quản lý tài chính</p>
            <Button onClick={() => setIsCreateSheetOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Tạo Bảng Đầu Tiên
            </Button>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              {deleteConfirm?.type === "sheet"
                ? `Bạn có chắc chắn muốn xóa bảng "${deleteConfirm.name}"? Tất cả dữ liệu sẽ bị mất vĩnh viễn.`
                : "Bạn có chắc chắn muốn xóa giao dịch này?"}
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Xóa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
