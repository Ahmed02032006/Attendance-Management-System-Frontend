import React, { useState } from 'react';
import { Search, Filter, Download, Printer, Eye, Edit, Trash2, Plus, DollarSign, CreditCard, Banknote, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminFinancePayments_Page = () => {
  // Sample payment data
  const [payments, setPayments] = useState([
    {
      id: 'PAY-001',
      student: {
        name: 'John Doe',
        id: 'STU-1001',
        avatar: 'JD'
      },
      amount: 500,
      date: '2023-05-15',
      type: 'Tuition Fee',
      method: 'Bank Transfer',
      status: 'Completed',
      classes: ['Grade 10', 'Section A']
    },
    {
      id: 'PAY-002',
      student: {
        name: 'Jane Smith',
        id: 'STU-1002',
        avatar: 'JS'
      },
      amount: 50,
      date: '2023-05-10',
      type: 'Exam Fee',
      method: 'Credit Card',
      status: 'Completed',
      classes: ['Grade 12', 'Section B']
    },
    {
      id: 'PAY-003',
      student: {
        name: 'Michael Johnson',
        id: 'STU-1003',
        avatar: 'MJ'
      },
      amount: 10,
      date: '2023-05-05',
      type: 'Library Fine',
      method: 'Cash',
      status: 'Pending',
      classes: ['Grade 9', 'Section C']
    },
    {
      id: 'PAY-004',
      student: {
        name: 'Sarah Williams',
        id: 'STU-1004',
        avatar: 'SW'
      },
      amount: 30,
      date: '2023-04-28',
      type: 'Sports Fee',
      method: 'Mobile Payment',
      status: 'Completed',
      classes: ['Grade 11', 'Section A']
    },
    {
      id: 'PAY-005',
      student: {
        name: 'David Brown',
        id: 'STU-1005',
        avatar: 'DB'
      },
      amount: 500,
      date: '2023-04-20',
      type: 'Tuition Fee',
      method: 'Bank Transfer',
      status: 'Failed',
      classes: ['Grade 8', 'Section B']
    },
  ]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(5);

  // Get current payments
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = payments.slice(indexOfFirstPayment, indexOfLastPayment);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(payments.length / paymentsPerPage)));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const totalPages = Math.ceil(payments.length / paymentsPerPage);

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Method icons
  const getMethodIcon = (method) => {
    switch (method) {
      case 'Bank Transfer': return <Banknote className="h-5 w-5 text-sky-600" />;
      case 'Credit Card': return <CreditCard className="h-5 w-5 text-purple-600" />;
      case 'Mobile Payment': return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'Cash': return <DollarSign className="h-5 w-5 text-gray-600" />;
      default: return <DollarSign className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - Clean Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-[19px] flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-800">
            Admin Finance Payment Page
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">

        {/* Payments Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Classes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPayments.length > 0 ? (
                  currentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                            <span className="text-sky-600 font-medium">{payment.student.avatar}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{payment.student.name}</div>
                            <div className="text-sm text-gray-500">ID: {payment.student.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">${payment.amount.toFixed(2)}</span>
                          <span className="text-sm text-gray-500">{payment.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {payment.classes.map((cls, index) => (
                            <span key={index} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              {cls}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getMethodIcon(payment.method)}
                          <span className="ml-2 text-sm text-gray-500">{payment.method}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center space-x-3">
                          <button
                            className="text-sky-600 hover:text-sky-900"
                            title="View"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {payments.length > 0 && (
            <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="mb-3 sm:mb-0">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstPayment + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastPayment, payments.length)}</span> of{' '}
                  <span className="font-medium">{payments.length}</span> payments
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                </button>

                {totalPages <= 6 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3.5 py-1.5 border text-sm font-medium ${currentPage === number
                        ? 'border-sky-600 bg-sky-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        } rounded-md transition-colors`}
                    >
                      {number}
                    </button>
                  ))
                ) : (
                  <>
                    {currentPage > 3 && (
                      <button
                        onClick={() => paginate(1)}
                        className="px-3.5 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
                      >
                        1
                      </button>
                    )}
                    {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                    {[
                      currentPage - 2,
                      currentPage - 1,
                      currentPage,
                      currentPage + 1,
                      currentPage + 2
                    ]
                      .filter(num => num > 0 && num <= totalPages)
                      .map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-3.5 py-1.5 border text-sm font-medium ${currentPage === number
                            ? 'border-sky-600 bg-sky-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            } rounded-md transition-colors`}
                        >
                          {number}
                        </button>
                      ))}
                    {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                    {currentPage < totalPages - 2 && (
                      <button
                        onClick={() => paginate(totalPages)}
                        className="px-3.5 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
                      >
                        {totalPages}
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminFinancePayments_Page;