const { combineRgb } = require('@companion-module/base')

module.exports = function (self) {
	return {
		restream_status: {
			type: 'boolean',
			name: 'Restream Preparation Status',
			description: 'Change button appearance based on restream preparation status',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'status',
					label: 'Status to check',
					default: 'ok',
					choices: [
						{ id: 'idle', label: 'Idle (not started)' },
						{ id: 'in_progress', label: 'In Progress' },
						{ id: 'ok', label: 'Success (OK)' },
						{ id: 'fail', label: 'Failed' },
					],
				},
			],
			callback: (feedback) => {
				return self.feedbackState === feedback.options.status
			},
		},

		has_error: {
			type: 'boolean',
			name: 'Has Error',
			description: 'Indicates if the last operation resulted in an error',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return self.feedbackState === 'fail' && self.lastError !== ''
			},
		},

		is_ready: {
			type: 'boolean',
			name: 'Ready for Operation',
			description: 'Indicates if the module is properly configured and ready to prepare restreams',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				// Check if all required config is present based on enabled destinations
				return (
					self.config &&
					self.validateConfig(self.config) &&
					self.feedbackState !== 'in_progress'
				)
			},
		},

		operation_in_progress: {
			type: 'boolean',
			name: 'Operation in Progress',
			description: 'Indicates if a restream preparation is currently in progress',
			defaultStyle: {
				bgcolor: combineRgb(255, 165, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.feedbackState === 'in_progress'
			},
		},
	}
}
