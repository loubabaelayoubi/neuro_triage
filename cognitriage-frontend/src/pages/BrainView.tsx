import BrainVisualization from '../components/BrainVisualization';
import { useAppContext } from '../context/AppContext';

export default function BrainView() {
  const { analysisResult } = useAppContext();
  const { result } = analysisResult;
  
  const imagingFindings = result?.note?.imaging_findings || {};
  
  const sliceData = imagingFindings.thumbnails || {};
  
  console.log('BrainView - Full result object:', result);
  console.log('BrainView - imagingFindings:', imagingFindings);
  console.log('BrainView - imagingFindings keys:', Object.keys(imagingFindings));
  console.log('BrainView - slices from imagingFindings.slices:', imagingFindings.slices);
  console.log('BrainView - thumbnails from imagingFindings.thumbnails:', imagingFindings.thumbnails);
  console.log('BrainView - final sliceData:', sliceData);
  console.log('BrainView - sliceData keys:', Object.keys(sliceData || {}));
  
  if (imagingFindings.slices) {
    console.log('BrainView - slices structure:', typeof imagingFindings.slices, imagingFindings.slices);
  }
  if (imagingFindings.thumbnails) {
    console.log('BrainView - thumbnails structure:', typeof imagingFindings.thumbnails, imagingFindings.thumbnails);
  }
  
  const brainData = {
    slices: sliceData,
    volumes: imagingFindings,
    qualityMetrics: imagingFindings.quality_metrics || {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Brain Visualization</h1>
        <div className="text-sm text-gray-500">
          Neuroimaging analysis and slice viewing
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <BrainVisualization
          slices={brainData.slices}
          volumes={brainData.volumes}
          qualityMetrics={brainData.qualityMetrics}
        />
      </div>

      {/* Only show analysis tabs if we have analysis data */}
      {result && imagingFindings && Object.keys(imagingFindings).length > 0 && (
        <div className="mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Volume Analysis */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-lg font-semibold mb-3">Volume Analysis</h3>
              <div className="space-y-3">
                {imagingFindings.hippocampal_volumes_ml && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Hippocampal Volumes (mL)</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Left:</span>
                        <span className="font-mono">{imagingFindings.hippocampal_volumes_ml.left?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Right:</span>
                        <span className="font-mono">{imagingFindings.hippocampal_volumes_ml.right?.toFixed(2) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
                {imagingFindings.brain_volumes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Brain Volumes (mL)</h4>
                    <div className="space-y-1">
                      {Object.entries(imagingFindings.brain_volumes).map(([region, volume]: [string, any]) => (
                        <div key={region} className="flex justify-between text-sm">
                          <span className="capitalize">{region.replace('_', ' ')}:</span>
                          <span className="font-mono">{typeof volume === 'number' ? volume.toFixed(2) : volume}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-lg font-semibold mb-3">Quality Metrics</h3>
              <div className="space-y-3">
                {imagingFindings.mta_score !== undefined && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">MTA Score</h4>
                    <div className="flex justify-between text-sm">
                      <span>Medial Temporal Atrophy:</span>
                      <span className={`font-mono ${imagingFindings.mta_score > 2 ? 'text-red-600' : imagingFindings.mta_score > 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {imagingFindings.mta_score}/4
                      </span>
                    </div>
                  </div>
                )}
                {imagingFindings.quality_metrics && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Image Quality</h4>
                    <div className="space-y-1">
                      {Object.entries(imagingFindings.quality_metrics).map(([metric, value]: [string, any]) => (
                        <div key={metric} className="flex justify-between text-sm">
                          <span className="capitalize">{metric.replace('_', ' ')}:</span>
                          <span className="font-mono">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comparison */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-lg font-semibold mb-3">Comparison</h3>
              <div className="space-y-3">
                {imagingFindings.percentiles && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Age-Matched Percentiles</h4>
                    <div className="space-y-1">
                      {Object.entries(imagingFindings.percentiles).map(([region, percentile]: [string, any]) => (
                        <div key={region} className="flex justify-between text-sm">
                          <span className="capitalize">{region.replace('_', ' ')}:</span>
                          <span className={`font-mono ${percentile < 10 ? 'text-red-600' : percentile < 25 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {typeof percentile === 'number' ? `${percentile.toFixed(1)}%` : percentile}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-3">
                  <p>Percentiles below 10% may indicate atrophy. Values are compared to age-matched healthy controls.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
