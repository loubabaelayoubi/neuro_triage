import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { useAppContext } from '../context/AppContext';
import { Brain, AlertTriangle, BarChart3, Upload } from 'lucide-react';

export default function Dashboard() {
  const { patientData, setPatientData, analysisResult, setAnalysisResult } = useAppContext();
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false)
  const pollRef = useRef<number | null>(null)

  const { files, moca, age, sex } = patientData;
  const { jobId, status } = analysisResult;

  const useDemoCase = async () => {
    setPatientData({ moca: 24, age: 72, sex: "M", files: [] })
    setAnalysisResult({ jobId: null, status: null, result: null })
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/demo-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Demo failed: ${response.status}`)
      }
      
      const data = await response.json()
      setAnalysisResult({ jobId: data.job_id })
      
    } catch (error) {
      console.error('Demo submission failed:', error)
    }
  }

  const useDemoPathology = async () => {
    setPatientData({ moca: 19, age: 78, sex: "F", files: [] })
    setAnalysisResult({ jobId: null, status: null, result: null })
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/demo-pathology`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Demo pathology failed: ${response.status}`)
      }
      
      const data = await response.json()
      setAnalysisResult({ jobId: data.job_id })
      
    } catch (error) {
      console.error('Demo pathology submission failed:', error)
    }
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      setPatientData({ files: [droppedFiles[0]] })
    }
  }, [setPatientData])

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const onSelectFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setPatientData({ files: [e.target.files[0]] })
  }, [setPatientData])

  const removeFile = (idx: number) => {
    setPatientData({ files: files.filter((_, i) => i !== idx) })
  }

  const canSubmit = useMemo(() => {
    const hasFiles = files.length > 0
    const mocaValid = typeof moca === "number" ? moca >= 0 && moca <= 30 : true
    const ageValid = typeof age === "number" ? age > 0 : true
    return hasFiles && mocaValid && ageValid
  }, [files, moca, age])

  const startSubmit = async () => {
    if (!canSubmit) return
    setAnalysisResult({ jobId: null, status: null, result: null })
    
    try {
      const mocaVal = typeof moca === "number" ? moca : 24
      const ageVal = typeof age === "number" ? age : 70
      const API = (import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8000'
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      fd.append('moca', JSON.stringify({ total: Number(mocaVal) }))
      fd.append('meta', JSON.stringify({ age: Number(ageVal), sex }))

      const resp = await fetch(`${API}/api/submit`, {
        method: 'POST',
        body: fd,
      })
      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        throw new Error(text || `Submit failed: ${resp.status} ${resp.statusText}`)
      }
      const data = await resp.json()
      setAnalysisResult({ jobId: data.job_id })
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  useEffect(() => {
    if (!jobId) return

    const poll = async () => {
      try {
        const API = (import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8000'
        const statusResp = await fetch(`${API}/api/status/${jobId}`).then(r => r.json())
        setAnalysisResult({ status: statusResp })

        if (statusResp.status === 'completed') {
          const resultResp = await fetch(`${API}/api/result/${jobId}`).then(r => r.json())
          console.log('Dashboard - Full result response:', resultResp)
          console.log('Dashboard - Result data:', resultResp.result)
          setAnalysisResult({ 
            result: resultResp.result,
            triage: resultResp.result?.triage,
            note: resultResp.result?.note,
            citations: resultResp.result?.citations,
            trials: resultResp.result?.trials,
            treatment_recommendations: resultResp.result?.treatment_recommendations
          })
          if (pollRef.current) {
            clearInterval(pollRef.current)
            pollRef.current = null
          }
        }
      } catch (error) {
        console.error('Polling failed:', error)
      }
    }

    poll()
    pollRef.current = window.setInterval(poll, 2000)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [jobId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cognitive Assessment Dashboard</h1>
        <div className="flex space-x-2">
          <Button onClick={useDemoCase} variant="outline">
            <Brain className="w-4 h-4 mr-2" />
            Demo - Healthy Case
          </Button>
          <Button onClick={useDemoPathology} variant="outline">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Demo - Pathology Case
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="border border-zinc-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Upload MRI Data</h2>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? 'border-blue-400 bg-blue-50' : 'border-zinc-300'
              }`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
            >
              <div className="space-y-2">
                <Upload className="w-10 h-10 mx-auto text-gray-400" />
                <div className="text-sm text-gray-600">
                  Drag and drop NIfTI file (.nii, .nii.gz) or DICOM file
                </div>
                <input
                  type="file"
                  accept=".nii,.nii.gz,.dcm,.dicom"
                  onChange={onSelectFiles}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
                >
                  Choose File
                </label>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Selected File:</h3>
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{file.name}</span>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patient Info */}
          <div className="border border-zinc-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MoCA Score (0-30)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={moca}
                  onChange={(e) => setPatientData({ moca: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter score (0-30)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="18"
                  max="120"
                  value={age}
                  onChange={(e) => setPatientData({ age: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sex
                </label>
                <select
                  value={sex}
                  onChange={(e) => setPatientData({ sex: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                  <option value="U">Unknown</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={startSubmit}
            disabled={!canSubmit}
            className="w-full"
            size="lg"
          >
            {jobId && status?.status === 'running' ? 'Processing...' : 'Start Analysis'}
          </Button>
        </div>

        {/* Progress Section - Only show during processing */}
        <div className="space-y-4">
          {/* Progress */}
          {status && status.status !== 'completed' && (
            <div className="border border-zinc-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Analysis Progress</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{status.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${status.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  Status: {status.status}
                </div>
              </div>
            </div>
          )}

          {/* Analysis Complete Message */}
          {status && status.status === 'completed' && (
            <div className="border border-green-200 rounded-lg p-6 bg-green-50">
              <h2 className="text-lg font-semibold mb-2 text-green-800">Analysis Complete</h2>
              <p className="text-sm text-green-700 mb-4">
                Your cognitive assessment has been completed successfully. View detailed results and brain analysis.
              </p>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => navigate('/brain')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  View Brain Analysis
                </Button>
                <Button 
                  onClick={() => navigate('/results')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Results
                </Button>
              </div>
            </div>
          )}

          {/* Educational Info - Fixed panel at bottom */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Assessment Overview</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Analyzes hippocampal volumes</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Compares to age-matched norms</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Identifies cognitive risk factors</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Generates clinical recommendations</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-xs text-green-700">
                Our AI-powered system provides comprehensive neuroimaging analysis to support early detection of cognitive decline and inform clinical decision-making.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
