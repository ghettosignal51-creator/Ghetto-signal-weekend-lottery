/**
 * Uganda Mobile Network Transaction Handler
 * Handles transaction fees for Airtel and MTN Uganda users
 * Deducts 300 UGX per transaction for both networks
 */

class TransactionHandler {
  constructor() {
    this.TRANSACTION_FEE = 300; // 300 shillings per transaction
    this.COUNTRY = 'Uganda';
    
    // Network configurations
    this.NETWORKS = {
      AIRTEL: {
        name: 'Airtel',
        recipientNumber: '0743712691',
        fee: 300
      },
      MTN: {
        name: 'MTN',
        recipientNumber: '0772118505',
        fee: 300
      }
    };
  }

  /**
   * Check if user is in Uganda using supported network and has accepted terms
   * @param {Object} user - User object containing country, network, and terms acceptance
   * @returns {boolean} - True if user qualifies for fee deduction
   */
  isQualifiedUser(user) {
    return (
      user &&
      user.country === this.COUNTRY &&
      (user.network === 'Airtel' || user.network === 'MTN') &&
      user.acceptedTermsAndConditions === true
    );
  }

  /**
   * Get network fee configuration
   * @param {string} network - Network name ('Airtel' or 'MTN')
   * @returns {Object|null} - Network config or null if not found
   */
  getNetworkConfig(network) {
    if (network === 'Airtel') {
      return this.NETWORKS.AIRTEL;
    } else if (network === 'MTN') {
      return this.NETWORKS.MTN;
    }
    return null;
  }

  /**
   * Process a transaction (deposit or withdrawal)
   * Deducts 300 shillings for qualified Airtel/MTN Uganda users
   * @param {Object} transaction - Transaction object
   * @param {number} transaction.amount - Transaction amount
   * @param {string} transaction.type - 'deposit' or 'withdrawal'
   * @param {Object} user - User object
   * @returns {Object} - Transaction result with fee applied if applicable
   */
  processTransaction(transaction, user) {
    const result = {
      originalAmount: transaction.amount,
      transactionType: transaction.type,
      feeApplied: false,
      fee: 0,
      finalAmount: transaction.amount,
      network: user?.network || 'Unknown',
      recipientNumber: '',
      successMessage: '',
      errorMessage: ''
    };

    // Check if user qualifies for fee deduction
    if (!this.isQualifiedUser(user)) {
      result.successMessage = `Transaction processed. Amount: ${transaction.amount} UGX`;
      return result;
    }

    // Get network configuration
    const networkConfig = this.getNetworkConfig(user.network);
    if (!networkConfig) {
      result.errorMessage = 'Unsupported network';
      return result;
    }

    // Apply fee for qualified users
    result.feeApplied = true;
    result.fee = networkConfig.fee;
    result.recipientNumber = networkConfig.recipientNumber;
    result.finalAmount = transaction.amount - networkConfig.fee;

    // Validate that final amount is not negative
    if (result.finalAmount < 0) {
      result.errorMessage = `Insufficient amount. Minimum amount needed: ${networkConfig.fee + 1} UGX`;
      result.feeApplied = false;
      result.finalAmount = transaction.amount;
      return result;
    }

    result.successMessage = `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} processed. Amount: ${result.originalAmount} UGX. ${user.network} fee deducted: ${result.fee} UGX. Final amount: ${result.finalAmount} UGX. Sent to ${result.recipientNumber}`;

    return result;
  }

  /**
   * Process a withdrawal
   * @param {number} amount - Withdrawal amount
   * @param {Object} user - User object
   * @returns {Object} - Transaction result
   */
  processWithdrawal(amount, user) {
    return this.processTransaction({ amount, type: 'withdrawal' }, user);
  }

  /**
   * Process a deposit
   * @param {number} amount - Deposit amount
   * @param {Object} user - User object
   * @returns {Object} - Transaction result
   */
  processDeposit(amount, user) {
    return this.processTransaction({ amount, type: 'deposit' }, user);
  }

  /**
   * Get user information summary with applicable fees
   * @param {Object} user - User object
   * @returns {Object} - User info with fee details
   */
  getUserFeeSummary(user) {
    const isQualified = this.isQualifiedUser(user);
    const networkConfig = isQualified ? this.getNetworkConfig(user.network) : null;

    return {
      country: user?.country || 'Unknown',
      network: user?.network || 'Unknown',
      acceptedTerms: user?.acceptedTermsAndConditions || false,
      isQualifiedUser: isQualified,
      applicableFee: isQualified ? networkConfig.fee : 0,
      feeRecipientNumber: isQualified ? networkConfig.recipientNumber : 'N/A',
      feeDescription: isQualified
        ? `${user.network} Uganda fee: ${networkConfig.fee} UGX per transaction`
        : 'No fees applicable (Only Airtel and MTN Uganda users with accepted T&Cs are charged)',
      supportedNetworks: ['Airtel', 'MTN']
    };
  }

  /**
   * Get all supported networks and their fees
   * @returns {Array} - Array of network configurations with fees
   */
  getSupportedNetworks() {
    return [
      {
        name: this.NETWORKS.AIRTEL.name,
        fee: this.NETWORKS.AIRTEL.fee,
        recipientNumber: this.NETWORKS.AIRTEL.recipientNumber
      },
      {
        name: this.NETWORKS.MTN.name,
        fee: this.NETWORKS.MTN.fee,
        recipientNumber: this.NETWORKS.MTN.recipientNumber
      }
    ];
  }
}

export default new TransactionHandler();
