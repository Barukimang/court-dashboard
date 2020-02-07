import gql from 'graphql-tag'

export const CourtConfig = gql`
  subscription CourtConfig($id: ID!) {
    courtConfig(id: $id) {
      id
      currentTerm
      termDuration
      feeToken {
        id
        name
        symbol
        decimals
      }
      anjToken {
        id
        name
        symbol
        decimals
      }
      jurorFee
      draftFee
      settleFee

      evidenceTerms
      commitTerms
      revealTerms
      appealTerms
      appealConfirmationTerms
      terms {
        id
        startTime
      }
      finalRoundReduction
      firstRoundJurorsNumber
      appealStepFactor
      maxRegularAppealRounds
      appealCollateralFactor
      appealConfirmCollateralFactor
      minActiveBalance
      modules {
        type
        address
      }
      terms {
        id
        startTime
      }
    }
  }
`