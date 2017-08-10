/* tslint:disable:no-sync-functions */

import { expect } from 'chai'

import { Repository } from '../../../src/models/repository'
import {
  getRecentBranches,
  createBranch,
  checkoutBranch,
  renameBranch,
} from '../../../src/lib/git'
import { setupFixtureRepository } from '../../fixture-helper'
import { Branch, BranchType } from '../../../src/models/branch'
import { Commit } from '../../../src/models/commit'
import { CommitIdentity } from '../../../src/models/commit-identity'

const temp = require('temp').track()

async function createAndCheckout(
  repository: Repository,
  name: string
): Promise<void> {
  await createBranch(repository, name)
  await checkoutBranch(repository, name)
}

describe('git/reflog', () => {
  let repository: Repository | null = null

  beforeEach(() => {
    const testRepoPath = setupFixtureRepository('test-repo')
    repository = new Repository(testRepoPath, -1, null, false)
  })

  after(() => {
    temp.cleanupSync()
  })

  describe('getRecentBranches', () => {
    it('returns the recently checked out branches', async () => {
      await createAndCheckout(repository!, 'branch-1')
      await createAndCheckout(repository!, 'branch-2')

      const branches = await getRecentBranches(repository!, 10)
      expect(branches).to.contain('branch-1')
      expect(branches).to.contain('branch-2')
    })

    it('works after renaming a branch', async () => {
      await createAndCheckout(repository!, 'branch-1')
      await createAndCheckout(repository!, 'branch-2')

      await renameBranch(
        repository!,
        new Branch(
          'branch-1',
          null,
          new Commit('', '', '', new CommitIdentity('', '', new Date()), []),
          BranchType.Local
        ),
        'branch-1-test'
      )

      const branches = await getRecentBranches(repository!, 10)
      expect(branches).to.contain('branch-1')
      expect(branches).to.contain('branch-2')
    })
  })
})
