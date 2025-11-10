import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SiGoogleforms } from "react-icons/si";
import { FaEye } from 'react-icons/fa';
import FormCreate from "./components/formCreate";
import ViewInvoiceDetails from "./components/ViewInvoiceDetails";
import { showSuccessAlert, showErrorAlert } from '../../../../../../../shared/utils/alerts';
import ReportButton from '../../../../../../../shared/components/ReportButton';
import Pagination from '../../../../../../../shared/components/Table/Pagination';
import SearchInput from "../../../../../../../shared/components/SearchInput";
import { purchaseService, providerService, sportsEquipmentService } from '../../../../../../../shared/services/purchaseService';

const Purchases = () => {
  const [purchasesList, setPurchasesList] = useState([]);
  const [providers, setProviders] = useState([]);
  const [equipment, setEquipment] = useState([]);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;

  const fetchPurchases = useCallback(async (page, search) => {
    try {
      const response = await purchaseService.getAll({ page, limit: rowsPerPage, search });
      if (response.success) {
        setPurchasesList(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (error) {
      showErrorAlert("Could not fetch purchases.", error.message);
    }
  }, []);

  const fetchRequiredData = useCallback(async () => {
    try {
      // Fetch all providers and equipment (assuming not too many for now)
      const providersResponse = await providerService.getAll({ limit: 1000 });
      if (providersResponse.success) {
        setProviders(providersResponse.data);
      }
      const equipmentResponse = await sportsEquipmentService.getAll({ limit: 1000 });
      if (equipmentResponse.success) {
        setEquipment(equipmentResponse.data);
      }
    } catch (error) {
      showErrorAlert("Could not fetch required data for the form.", error.message);
    }
  }, []);

  useEffect(() => {
    fetchPurchases(currentPage, searchTerm);
  }, [currentPage, searchTerm, fetchPurchases]);

  useEffect(() => {
    fetchRequiredData();
  }, [fetchRequiredData]);

  const handleCreate = async (formData) => {
    try {
      await purchaseService.create(formData);
      showSuccessAlert("Created!", "The new purchase has been registered successfully.");
      setIsCreateModalOpen(false);
      fetchPurchases(1, ""); // Go back to first page
    } catch (error) {
      showErrorAlert("Creation Error", error.message);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await purchaseService.getById(id);
      if (response.success) {
        setSelectedPurchase(response.data);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      showErrorAlert("Error", "Could not fetch purchase details.");
    }
  };

  const statusStyles = {
    'Received': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Cancelled': 'bg-red-100 text-red-800',
  };

  const reportData = useMemo(() => {
    return purchasesList.map(item => ({
      purchaseNumber: item.purchaseNumber || '',
      provider: item.provider?.businessName || 'N/A',
      totalAmount: item.totalAmount || 0,
      purchaseDate: new Date(item.purchaseDate).toLocaleDateString(),
      status: item.status || '',
    }));
  }, [purchasesList]);

  return (
    <div id="contentPurchases" className="w-full h-auto grid grid-rows-[auto_1fr] relative">
      <div id="header" className="w-full h-auto p-8">
        <h1 className="text-4xl font-bold text-gray-800">Purchases</h1>
      </div>
      <div id="body" className="w-full h-auto flex flex-col gap-2 p-4">
        <div id="actionButtons" className="w-full h-auto p-2 flex flex-row justify-between items-center">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by number or provider..."
          />
          <div id="buttons" className="h-auto flex flex-row items-center justify-end gap-4">
            <ReportButton
              data={reportData}
              fileName="Purchases_Report"
              columns={[
                { header: "Purchase Number", accessor: "purchaseNumber" },
                { header: "Provider", accessor: "provider" },
                { header: "Total Amount", accessor: "totalAmount" },
                { header: "Purchase Date", accessor: "purchaseDate" },
                { header: "Status", accessor: "status" },
              ]}
            />
            <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap">
              Create Purchase <SiGoogleforms size={20} />
            </button>
          </div>
        </div>
        <div className="shadow-lg rounded-2xl bg-white flex flex-col border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto hidden sm:block w-full">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-gray-700 text-sm uppercase tracking-wider bg-gradient-to-r from-primary-purple to-primary-blue">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left font-semibold text-white">Purchase #</th>
                  <th scope="col" className="px-6 py-4 text-left font-semibold text-white">Provider</th>
                  <th scope="col" className="px-6 py-4 text-left font-semibold text-white">Amount</th>
                  <th scope="col" className="px-6 py-4 text-left font-semibold text-white">Date</th>
                  <th scope="col" className="px-6 py-4 text-left font-semibold text-white">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-white text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {purchasesList.length > 0 ? (
                  purchasesList.map((purchase) => (
                    <tr key={purchase.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{purchase.purchaseNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.provider?.businessName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${parseFloat(purchase.totalAmount).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 font-semibold leading-tight rounded-full text-xs ${statusStyles[purchase.status] || 'bg-gray-100 text-gray-800'}`}>
                          {purchase.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handleViewDetails(purchase.id)} title="View Details" className="p-2 text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors">
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-500">
                      No purchases to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {purchasesList.length > 0 && (
          <div className="w-full border-none shadow-none">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
      <FormCreate
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        equipmentList={equipment}
        providerList={providers}
      />
      <ViewInvoiceDetails
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        invoiceData={selectedPurchase}
      />
    </div>
  );
}

export default Purchases;
