import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import axios from "../utils/secureAxios";
import html2pdf from "html2pdf.js";
import Swal from "sweetalert2";
import InvoicePreview from "../components/InvoicePreview";
import {
  FaEye,
  FaTrash,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaPlusCircle,
} from "react-icons/fa";
import InvoiceForm from "./InvoiceForm";
import ProfileDropdown from "./ProfileDropdown";

export default function ViewInvoices() {
  const [firms, setFirms] = useState([]);

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceToView, setInvoiceToView] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filterByFirm, setFilterByFirm] = useState([]);

  const [selectedFirm, setSelectedFirm] = useState(null);
  const [dateError, setDateError] = useState("");
  const [exporting, setExporting] = useState(false);
  // state
  const [showEditModal, setShowEditModal] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 6; // Number of invoices per page
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );
  const nextPage = () => {
    if (currentPage * invoicesPerPage < filteredInvoices.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const navigate = useNavigate();

  // const openEdit = async (inv) => {
  //   setShowEditModal(true);
  //   setInvoiceToEdit(null); // show a spinner if you want
  //   try {
  //     const { data } = await axios.get(
  //       `https://taskbe.sharda.co.in/api/invoices/${encodeURIComponent(
  //         inv.invoiceNumber
  //       )}`
  //     );
  //     setInvoiceToEdit(data); // always DB truth
  //   } catch (e) {
  //     setShowEditModal(false);
  //     Swal.fire("Error", "Could not load invoice.", "error");
  //   }
  // };

  const handleEdited = (updated) => {
    setInvoices((prev) =>
      prev.map((x) => (x.invoiceNumber === updated.invoiceNumber ? updated : x))
    );
    setFilteredInvoices((prev) =>
      prev.map((x) => (x.invoiceNumber === updated.invoiceNumber ? updated : x))
    );
  };

  useEffect(() => {
    const fetchFirms = async () => {
      try {
        const res = await axios.get("https://taskbe.sharda.co.in/firms", {
          withCredentials: true, // Ensure cookies are sent
        });
        setFirms(res.data);
      } catch (error) {
        console.error("Error fetching firms:", error);
      }
    };

    fetchFirms();
  }, []);

  // Temporary: Use regular axios without security headers
  // useEffect(() => {
  //   axios.get("https://taskbe.sharda.co.in/api/clients/details", {
  //     withCredentials: true
  //   })
  //   .then(res => console.log("Clients:", res.data))
  //   .catch(err => console.error("Error:", err.response?.data));
  // }, []);
  // console.log("Token from localStorage:", localStorage.getItem("authToken"));

  useEffect(() => {
    axios
      .get("/clients/details")
      .then((res) => {
        console.log("Clients fetched:", res.data);
        setClients(res.data);
      })
      .catch((error) => {
        console.error("Error fetching clients:", error);
        if (error.response?.status === 401) {
          // Token might be invalid/expired
          Swal.fire("Session Expired", "Please login again", "error");
          navigate("/login-page");
        }
      });
  }, []);

  const openEdit = async (inv) => {
    setShowEditModal(true);
    setInvoiceToEdit(null);
    try {
      // USE secureAxios with relative path (baseURL is already set)
      const { data } = await axios.get(
        `/invoices/${encodeURIComponent(inv.invoiceNumber)}`
      );
      setInvoiceToEdit(data);
    } catch (e) {
      setShowEditModal(false);
      console.error("Error loading invoice:", e);
      if (e.response?.status === 401) {
        Swal.fire("Session Expired", "Please login again", "error");
        navigate("/login-page");
      } else {
        Swal.fire("Error", "Could not load invoice.", "error");
      }
    }
  };

  const clientOptions = clients.map((client) => ({
    value: client._id,
    label: client.name,
  }));

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching initial data...");

        // Fetch clients
        const clientsRes = await axios.get("/clients/details");
        console.log("Clients fetched:", clientsRes.data);
        setClients(clientsRes.data);

        // Fetch all invoices
        const invoicesRes = await axios.get("/invoices");
        console.log("All invoices fetched:", invoicesRes.data);

        const sortedInvoices = [...(invoicesRes.data || [])].sort(
          (a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)
        );
        console.log("Sorted invoices:", sortedInvoices);
        setInvoices(sortedInvoices);
        setFilteredInvoices(sortedInvoices);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    console.log("Selected client changed:", selectedClient);

    if (!selectedClient) {
      // When no client is selected, fetch all invoices again
      const fetchAllInvoices = async () => {
        try {
          console.log("Fetching all invoices...");
          const res = await axios.get("/invoices");
          const sortedInvoices = [...(res.data || [])].sort(
            (a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)
          );
          setInvoices(sortedInvoices);
        } catch (error) {
          console.error("Error fetching all invoices:", error);
          setInvoices([]);
        }
      };
      fetchAllInvoices();
      return;
    }

    // Rest of your client filtering logic...
    const fetchInvoicesByClient = async () => {
      try {
        console.log("Fetching invoices for client:", selectedClient);
        const res = await axios.get(
          `/invoices?clientId=${selectedClient.value}`
        );
        const filteredInvoices = res.data || [];
        const sortedInvoices = [...filteredInvoices].sort(
          (a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)
        );
        setInvoices(sortedInvoices);
      } catch (error) {
        console.error("Error fetching invoices for client:", error);
        setInvoices([]);
      }
    };
    fetchInvoicesByClient();
  }, [selectedClient]);

  useEffect(() => {
    if (!fromDate && !toDate) {
      setFilteredInvoices(invoices);
      return;
    }

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const filtered = invoices.filter((invoice) => {
      const invDate = new Date(invoice.invoiceDate);
      if (from && invDate < from) return false;
      if (to && invDate > to) return false;
      return true;
    });

    setFilteredInvoices(filtered);
  }, [fromDate, toDate, invoices]);

  const downloadInvoice = (invoice) => {
    console.log("Download button clicked for invoice:", invoice);
    setInvoiceToView(invoice);
    setShowInvoiceModal(true);
  };

  const handleGeneratePDF = () => {
    const element = document.getElementById("invoice-to-print");
    if (!element) return;

    // Save original styles
    const originalHeight = element.style.height;
    const originalMaxHeight = element.style.maxHeight;
    const originalOverflow = element.style.overflow;
    const originalWidth = element.style.width;

    // Expand fully for capture
    element.style.height = "auto";
    element.style.maxHeight = "none";
    element.style.overflow = "visible";
    element.style.width = "794px"; // A4 width in px at 96dpi

    const opt = {
      margin: 0,
      filename: `${invoiceToView.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
      },
      jsPDF: {
        unit: "px",
        format: [794, 1123], // A4 portrait in px
        orientation: "portrait",
      },
    };
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        setShowInvoiceModal(false);

        // Restore styles
        element.style.height = originalHeight;
        element.style.maxHeight = originalMaxHeight;
        element.style.overflow = originalOverflow;
        element.style.width = originalWidth;
      })
      .catch((error) => {
        console.error("PDF generation error:", error);

        // Restore styles even if error
        element.style.height = originalHeight;
        element.style.maxHeight = originalMaxHeight;
        element.style.overflow = originalOverflow;
        element.style.width = originalWidth;
      });
  };

  // delete invoice
  const handleDeleteInvoice = async (invoiceNumber) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete invoice ${invoiceNumber}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/invoices/${invoiceNumber}`);
        setInvoices((prev) =>
          prev.filter((inv) => inv.invoiceNumber !== invoiceNumber)
        );
        Swal.fire("Deleted!", "Invoice has been deleted.", "success");
      } catch (error) {
        console.error("Failed to delete invoice", error);
        Swal.fire("Error", "Failed to delete invoice.", "error");
      }
    }
  };

  function numberToWordsIndian(num) {
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const numberToWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " and " + numberToWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          numberToWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + numberToWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          numberToWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + numberToWords(n % 100000) : "")
        );
      return (
        numberToWords(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + numberToWords(n % 10000000) : "")
      );
    };

    const [rupees, paise] = num.toFixed(2).split(".");
    const rupeeWords = numberToWords(parseInt(rupees));
    const paiseWords =
      paise !== "00" ? ` and ${numberToWords(parseInt(paise))} Paise` : "";
    return rupeeWords + paiseWords + " Rupees Only";
  }

  // Firm options for the dropdown
  const firmOptions = firms.map((firm) => ({
    value: firm.name,
    label: firm.name,
  }));

  // Filter invoices when firm is selected
  useEffect(() => {
    if (!selectedFirm) {
      setFilteredInvoices(invoices); // No firm selected, show all invoices
      return;
    }

    const filtered = invoices.filter(
      (invoice) => invoice.selectedFirm.name === selectedFirm.value
    );
    setFilteredInvoices(filtered);
  }, [selectedFirm, invoices]);

  const handleFromDateChange = (e) => {
    const newFromDate = e.target.value;
    setFromDate(newFromDate);
    setDateError("");

    if (toDate && new Date(toDate) < new Date(newFromDate)) {
      setToDate("");
      setDateError("To Date was reset to ensure it comes after From Date");
    }
  };

  const exportInvoices = async () => {
    try {
      setExporting(true);

      // 1) Send OTP - USE relative path
      await axios.post("/send-otp-view-invoice");

      // 2) Ask user for OTP
      const { value: otp, isConfirmed } = await Swal.fire({
        title: "Verify OTP",
        text: "Enter the 6-digit OTP sent to your email",
        input: "text",
        inputAttributes: {
          inputmode: "numeric",
          autocomplete: "one-time-code",
        },
        inputValidator: (v) => (!v ? "Please enter OTP" : undefined),
        showCancelButton: true,
        confirmButtonText: "Verify",
      });
      if (!isConfirmed) return;

      // 3) Build filters
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (selectedClient?.value) params.clientId = selectedClient.value;

      // 4) Call export with relative path
      const res = await axios.get("/invoices/export.xlsx", {
        params,
        responseType: "blob",
        headers: { "x-otp": String(otp).trim() },
      });

      const dispo = res.headers["content-disposition"] || "";
      const m = dispo.match(/filename="?(.*)"?$/);
      const filename =
        (m && m[1]) || `invoices_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      Swal.fire(
        "Export failed",
        err?.response?.data?.error || "Could not export invoices.",
        "error"
      );
    } finally {
      setExporting(false);
    }
  };

  // Is this invoice a GST invoice?
  const isGSTInvoice = (inv) => !!inv?.selectedFirm?.gstin;

  // Compute the number you want to SHOW in the table
  const displayTotal = (inv) => {
    // Prefer fields saved on the invoice if present
    const subtotal =
      typeof inv?.totalAmount === "number"
        ? inv.totalAmount
        : Array.isArray(inv?.items)
        ? inv.items.reduce((s, it) => s + Number(it.qty) * Number(it.rate), 0)
        : 0;

    if (!isGSTInvoice(inv)) return subtotal;

    // If GST invoice: prefer a precomputed totalAmountWithTax if saved,
    // else sum tax parts, else fall back to fixed 18% on subtotal
    const partsTotal =
      (inv?.igstAmount || 0) + (inv?.cgstAmount || 0) + (inv?.sgstAmount || 0);

    if (typeof inv?.totalAmountWithTax === "number")
      return inv.totalAmountWithTax;
    if (partsTotal > 0) return subtotal + partsTotal;

    // last-resort calculation if nothing saved
    return subtotal * 1.18;
  };

  const handleNewInvoice = () => {
    navigate("/invoice-form");
  };

  const handleCloseInvoiceForm = () => {
    setShowInvoiceForm(false); // Close the Invoice Form
  };

  return (
    <div className="relative">
      {/* View Invoices Table (Existing Table) */}
      <div className="content p-4">
        <div className="mb-3 flex justify-between items-center">
          <h2 className="text-4xl font-bold font-sans">Invoices</h2>
          {/* New Invoice Button */}
          <div className="flex items-center">
            <button
              onClick={handleNewInvoice}
              style={{ backgroundColor: "#7DA2C6" }}
              className="bg-blue-500 text-white py-2 px-6 rounded-sm shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex justify-center items-center">
                <FaPlusCircle className="text-s mt-1" />
                <span className="ml-2 font-sans">New Invoice</span>
              </div>
            </button>
            <ProfileDropdown />{" "}
            {/* Profile Dropdown Icon next to New Invoice button */}
          </div>
        </div>

        <div className="bg-[#F0F0F0] p-4 rounded-lg shadow-sm mb-6 ">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Client Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <Select
                options={clientOptions}
                onChange={setSelectedClient}
                placeholder="All Clients"
                isClearable
                className="text-sm "
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: "transparent", // Transparent background
                    borderColor: state.isFocused ? "#7DA2C6" : "#d1d5db", // Border color on focus and default
                    boxShadow: state.isFocused ? "0 0 0 1px #7DA2C6" : "none", // Add shadow when focused
                    "&:hover": {
                      borderColor: "#7DA2C6", // Hover border color
                    },
                  }),

                  singleValue: (provided) => ({
                    ...provided,
                    color: "#1f2937", // Dark text color for the selected item
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#9ca3af", // Light placeholder text color
                  }),
                }}
              />
            </div>

            {/* Firm Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Firm
              </label>
              <Select
                options={firmOptions}
                onChange={setSelectedFirm}
                placeholder="All Firms"
                isClearable
                className="text-sm"
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: "transparent", // Transparent background
                    borderColor: state.isFocused ? "#7DA2C6" : "#d1d5db", // Border color on focus and default
                    boxShadow: state.isFocused ? "0 0 0 1px #7DA2C6" : "none", // Add shadow when focused
                    "&:hover": {
                      borderColor: "#7DA2C6", // Hover border color
                    },
                  }),

                  singleValue: (provided) => ({
                    ...provided,
                    color: "#1f2937", // Dark text color for the selected item
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#9ca3af", // Light placeholder text color
                  }),
                }}
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={exportInvoices}
              disabled={exporting}
              className={`px-4 py-2 rounded-md text-white text-sm font-medium shadow-sm transition
    ${
      exporting
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-emerald-600 hover:bg-emerald-700"
    }`}
              title="Export filtered invoices to Excel"
            >
              {exporting ? "Exporting…" : "Export to Excel"}
            </button>
          </div>
        </div>

        <div
          style={{
            maxHeight: "500px", // Adjust height as needed
            overflowY: "auto",
            marginTop: "10px",
          }}
        >
          {isLoading ? (
            <div className="space-y-4 mt-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse flex space-x-6">
                  <div className="rounded bg-gray-200 h-10 w-32"></div>
                  <div className="rounded bg-gray-200 h-10 w-32"></div>
                  <div className="rounded bg-gray-200 h-10 w-40"></div>
                  <div className="rounded bg-gray-200 h-10 w-28"></div>
                  <div className="rounded bg-gray-200 h-10 w-40"></div>
                </div>
              ))}
            </div>
          ) : (
            <table
              border="1"
              className="min-w-full border border-gray-200 rounded-lg overflow-hidden shadow-lg mt-6"
            >
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left border-b border-gray-300">
                    Invoice Number
                  </th>
                  <th className="py-3 px-4 text-left border-b border-gray-300">
                    Invoice Date
                  </th>
                  <th className="py-3 px-4 text-left border-b border-gray-300">
                    Client Name
                  </th>
                  <th className="py-3 px-4 text-left border-b border-gray-300">
                    Total Amount
                  </th>
                  <th className="py-3 px-4 text-left border-b border-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                )}
                {currentInvoices.map((inv) => (
                  <tr
                    key={inv.invoiceNumber}
                    className="bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-3 px-4 border-b border-gray-200">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      {inv.customer.name}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      ₹{displayTotal(inv).toFixed(2)}
                    </td>
                    <td>
                      <button
                        onClick={() => openEdit(inv)}
                        className="ml-2  hover:bg-amber-200 text-amber-500 px-3 py-1 rounded-md text-sm font-medium transition border-1 border-amber-400"
                      >
                        <FaEye />
                      </button>

                      {showEditModal && invoiceToEdit && (
                        <div className="fixed inset-0 z-[1001] flex items-center justify-center">
                          <div className="bg-white rounded-md shadow-xl w-[100vw]">
                            <InvoiceForm
                              key={invoiceToEdit.invoiceNumber}
                              initialInvoice={invoiceToEdit}
                              onSaved={handleEdited}
                              onClose={() => {
                                setShowEditModal(false);
                                setInvoiceToEdit(null);
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleDeleteInvoice(inv.invoiceNumber)}
                        className="  hover:bg-red-200 text-red-500 px-3 py-1 rounded-md text-sm font-medium transition ml-10 border-1 border-red-400"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-4 space-x-4">
          {/* Previous Button */}
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="bg-orange-50 text-gray-500 p-3 rounded-full hover:bg-orange-100 transition-colors"
          >
            <FaChevronLeft className="text-l" />
          </button>

          {/* Page Number */}
          <span className="text-m font-semibold text-gray-700">
            Page {currentPage}
          </span>

          {/* Next Button */}
          <button
            onClick={nextPage}
            disabled={currentPage * invoicesPerPage >= filteredInvoices.length}
            className="bg-orange-50 text-gray-500 p-3 rounded-full hover:bg-orange-100 transition-colors"
          >
            <FaChevronRight className="text-l" />
          </button>
        </div>

        {/* Modal for PDF preview and generation */}
        {showInvoiceModal && invoiceToView && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              id="invoice-modal-content"
              style={{
                backgroundColor: "white",
                // padding: "20px",
                maxHeight: "90vh",
                overflowY: "scroll",
                width: "auto", // ✅ FIXED: No fixed maxWidth
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingBottom: "20px",
              }}
            >
              <div
                id="invoice-to-print"
                style={{
                  width: "794px", // ✅ Strict A4 width
                  backgroundColor: "#fff",
                  // padding: "20px",
                  boxSizing: "border-box",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  fontSize: 12,
                  color: "#000",
                }}
              >
                {/* <InvoicePreview invoice={invoiceToView} /> */}
                <InvoicePreview
                  selectedFirm={invoiceToView.selectedFirm}
                  invoiceType={invoiceToView.invoiceType}
                  invoiceNumber={invoiceToView.invoiceNumber}
                  invoiceDate={invoiceToView.invoiceDate}
                  placeOfSupply={invoiceToView.placeOfSupply}
                  customer={invoiceToView.customer}
                  items={invoiceToView.items}
                  notes={invoiceToView.notes}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={handleGeneratePDF}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#1a73e8",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  style={{
                    marginLeft: "10px",
                    padding: "8px 16px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conditionally render the InvoiceForm */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-[80vw] max-w-3xl">
            <InvoiceForm onClose={handleCloseInvoiceForm} />
          </div>
        </div>
      )}
    </div>
  );
}
