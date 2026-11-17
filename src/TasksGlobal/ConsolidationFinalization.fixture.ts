// Generated solely by actual staged backend synthetic controller scenarios, no runtime data.
export const publicFixtures = {
  "readyCheck": {
    "blockers": [],
    "checkId": "834a083b-0988-4517-b1d1-b398e84ec52f",
    "destinationFolderId": "destinationFolder",
    "operationId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "ready": true,
    "revision": "364e5a39dc39c6f61187d781fb61b72cad6d8ae2c36161038d874745d45a29aa",
    "sourceFolderId": "sourceFolder",
    "sourceTree": {
      "complete": true,
      "remaining": []
    }
  },
  "transferStatus": {
    "operationId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "revision": "e67edd2677bd055f42d355686f38e4e5b142376bcf0f738af7cc5b61bc3d4c42",
    "state": "TRANSFERRING",
    "sourceMilestoneId": 1,
    "destinationMilestoneId": 2,
    "accountingContractId": 20,
    "caseMappings": [
      {
        "destinationCaseId": 21,
        "sourceCaseId": 11
      }
    ],
    "units": [
      {
        "moved": true,
        "unitId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "unitKey": "milestone:1",
        "state": "MOVED"
      }
    ],
    "counts": {
      "moved": 1,
      "pending": 0
    },
    "batches": [
      {
        "actorId": 7,
        "previewId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "requestId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
      }
    ],
    "requiresRevalidation": true,
    "documentsReady": false,
    "sourceDatabaseRemoved": false,
    "sourceFolderTrashed": false,
    "cleanup": {
      "reason": "",
      "sourceFolderId": null,
      "step": "NOT_STARTED",
      "sourceFolderStatus": "UNKNOWN",
      "remainingCount": null,
      "verificationComplete": false
    },
    "allowedActions": [
      "PREVIEW",
      "CHECK",
      "FINALIZE"
    ]
  },
  "completedAck": {
    "operationId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "revision": "580b71d9c91975ebcc4799a0652d98d3da4ddf9ab36da1bac3bce9bc8ccb5aca",
    "requestId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "checkId": "834a083b-0988-4517-b1d1-b398e84ec52f",
    "checkedRevision": "364e5a39dc39c6f61187d781fb61b72cad6d8ae2c36161038d874745d45a29aa",
    "destinationMilestoneId": 2,
    "state": "COMPLETED",
    "documentsReady": true,
    "sourceDatabaseRemoved": true,
    "sourceFolderTrashed": true
  },
  "completedStatus": {
    "operationId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "revision": "580b71d9c91975ebcc4799a0652d98d3da4ddf9ab36da1bac3bce9bc8ccb5aca",
    "state": "COMPLETED",
    "sourceMilestoneId": 1,
    "destinationMilestoneId": 2,
    "accountingContractId": 20,
    "caseMappings": [
      {
        "destinationCaseId": 21,
        "sourceCaseId": 11
      }
    ],
    "units": [
      {
        "moved": true,
        "unitId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "unitKey": "milestone:1",
        "state": "MOVED"
      }
    ],
    "counts": {
      "moved": 1,
      "pending": 0
    },
    "batches": [
      {
        "actorId": 7,
        "previewId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "requestId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
      }
    ],
    "requiresRevalidation": true,
    "documentsReady": true,
    "sourceDatabaseRemoved": true,
    "sourceFolderTrashed": true,
    "cleanup": {
      "reason": "GUARDED_DATABASE_CLEANUP_COMMITTED",
      "sourceFolderId": "sourceFolder",
      "step": "COMPLETED",
      "sourceFolderStatus": "TRASHED",
      "remainingCount": 0,
      "verificationComplete": true
    },
    "allowedActions": []
  },
  "completedHistory": {
    "retired": true,
    "sourceCaseId": 11,
    "sourceMilestoneId": 1,
    "destinationMilestoneId": 2,
    "destinationCaseId": 21,
    "destinationMilestoneName": null,
    "destinationCaseName": "Destination"
  },
  "restoreOnlyCheck": {
    "operationId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "checkId": "a68ef0f4-b5da-43fd-89f5-ddb67455e80c",
    "revision": "2964eefb2bbd938a01a4b24223048df8556739dba6ccf91d7f4ec8fefd646dbc",
    "ready": false,
    "sourceFolderId": "sourceFolder",
    "destinationFolderId": "destinationFolder",
    "blockers": [
      {
        "code": "SOURCE_MISSING_OR_CHANGED",
        "reference": "sourceFolder"
      },
      {
        "code": "STORED_FOLDER_OUTSIDE_SOURCE",
        "reference": "caseFolder"
      }
    ],
    "sourceTree": {
      "complete": false,
      "remaining": []
    }
  },
  "ownedTrashStatus": {
    "operationId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "revision": "14a9cbecc1848e457ae6d339bc8a1f2701815f612916bd8f9063eaefc025a5c1",
    "state": "RECONCILIATION_REQUIRED",
    "sourceMilestoneId": 1,
    "destinationMilestoneId": 2,
    "accountingContractId": 20,
    "caseMappings": [
      {
        "destinationCaseId": 21,
        "sourceCaseId": 11
      }
    ],
    "units": [
      {
        "moved": true,
        "unitId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "unitKey": "milestone:1",
        "state": "MOVED"
      }
    ],
    "counts": {
      "moved": 1,
      "pending": 0
    },
    "batches": [
      {
        "actorId": 7,
        "previewId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "requestId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
      }
    ],
    "requiresRevalidation": true,
    "documentsReady": false,
    "sourceDatabaseRemoved": false,
    "sourceFolderTrashed": true,
    "cleanup": {
      "reason": "POST_TRASH_CENSUS_CHANGED",
      "sourceFolderId": "sourceFolder",
      "step": "RECONCILIATION_REQUIRED",
      "sourceFolderStatus": "TRASHED",
      "remainingCount": null,
      "verificationComplete": false
    },
    "allowedActions": [
      "CHECK",
      "RETRY"
    ]
  },
  "restoredAck": {
    "operationId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "revision": "3c2e7cb47329f9e69cebd49fa96fd02bb1a211def374e73898cd37e5ef6d3565",
    "requestId": "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    "checkId": "a68ef0f4-b5da-43fd-89f5-ddb67455e80c",
    "checkedRevision": "2964eefb2bbd938a01a4b24223048df8556739dba6ccf91d7f4ec8fefd646dbc",
    "destinationMilestoneId": 2,
    "state": "RECONCILIATION_REQUIRED",
    "documentsReady": false,
    "sourceDatabaseRemoved": false,
    "sourceFolderTrashed": false
  },
  "restoredStatus": {
    "operationId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "revision": "3c2e7cb47329f9e69cebd49fa96fd02bb1a211def374e73898cd37e5ef6d3565",
    "state": "RECONCILIATION_REQUIRED",
    "sourceMilestoneId": 1,
    "destinationMilestoneId": 2,
    "accountingContractId": 20,
    "caseMappings": [
      {
        "destinationCaseId": 21,
        "sourceCaseId": 11
      }
    ],
    "units": [
      {
        "moved": true,
        "unitId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "unitKey": "milestone:1",
        "state": "MOVED"
      }
    ],
    "counts": {
      "moved": 1,
      "pending": 0
    },
    "batches": [
      {
        "actorId": 7,
        "previewId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "requestId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
      }
    ],
    "requiresRevalidation": true,
    "documentsReady": false,
    "sourceDatabaseRemoved": false,
    "sourceFolderTrashed": false,
    "cleanup": {
      "reason": "OWNED_ROOT_RESTORED",
      "sourceFolderId": "sourceFolder",
      "step": "RECONCILIATION_REQUIRED",
      "sourceFolderStatus": "UNKNOWN",
      "remainingCount": null,
      "verificationComplete": false
    },
    "allowedActions": [
      "CHECK",
      "RETRY"
    ]
  },
  "unconfirmedStatus": {
    "operationId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "revision": "14a9cbecc1848e457ae6d339bc8a1f2701815f612916bd8f9063eaefc025a5c1",
    "state": "RECONCILIATION_REQUIRED",
    "sourceMilestoneId": 1,
    "destinationMilestoneId": 2,
    "accountingContractId": 20,
    "caseMappings": [
      {
        "destinationCaseId": 21,
        "sourceCaseId": 11
      }
    ],
    "units": [
      {
        "moved": true,
        "unitId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "unitKey": "milestone:1",
        "state": "MOVED"
      }
    ],
    "counts": {
      "moved": 1,
      "pending": 0
    },
    "batches": [
      {
        "actorId": 7,
        "previewId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "requestId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
      }
    ],
    "requiresRevalidation": true,
    "documentsReady": false,
    "sourceDatabaseRemoved": false,
    "sourceFolderTrashed": false,
    "cleanup": {
      "reason": "OWNED_TRASH_NOT_CONFIRMED",
      "sourceFolderId": "sourceFolder",
      "step": "RECONCILIATION_REQUIRED",
      "sourceFolderStatus": "UNKNOWN",
      "remainingCount": null,
      "verificationComplete": false
    },
    "allowedActions": [
      "CHECK",
      "RETRY"
    ]
  },
  "namedHistory": {
    "retired": true,
    "sourceCaseId": 11,
    "sourceMilestoneId": 1,
    "destinationMilestoneId": 2,
    "destinationCaseId": 21,
    "destinationMilestoneName": "Raport końcowy",
    "destinationCaseName": "Przegląd dokumentacji"
  },
  "unavailableHistory": {
    "retired": true,
    "sourceCaseId": 11,
    "sourceMilestoneId": 1,
    "destinationMilestoneId": 2,
    "destinationCaseId": 21,
    "destinationMilestoneName": null,
    "destinationCaseName": null
  }
};
