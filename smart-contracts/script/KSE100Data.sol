// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KSE100Data
 * @notice Official KSE-100 scrip names and symbols ported from psx-scrips.ts
 * Split into 20 batches of 5 tokens for safe block-gas execution on Base Sepolia (~10.4M gas per batch).
 */
library KSE100Data {
    uint256 public constant TOTAL_BATCHES = 20;

    function getBatch(uint256 index) internal pure returns (string[] memory names, string[] memory symbols) {
        if (index == 0) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Allied Bank Limited"; symbols[0] = "ABL";
            names[1] = "Askari Bank Limited"; symbols[1] = "AKBL";
            names[2] = "Bank Alfalah Limited"; symbols[2] = "BAFL";
            names[3] = "Bank AL Habib Limited"; symbols[3] = "BAHL";
            names[4] = "BankIslami Pakistan Limited"; symbols[4] = "BML";
        }
        else if (index == 1) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "The Bank of Punjab"; symbols[0] = "BOP";
            names[1] = "Faysal Bank Limited"; symbols[1] = "FABL";
            names[2] = "Habib Bank Limited"; symbols[2] = "HBL";
            names[3] = "Habib Metropolitan Bank Ltd"; symbols[3] = "HMB";
            names[4] = "MCB Bank Limited"; symbols[4] = "MCB";
        }
        else if (index == 2) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Meezan Bank Limited"; symbols[0] = "MEBL";
            names[1] = "National Bank of Pakistan"; symbols[1] = "NBP";
            names[2] = "Standard Chartered Bank (Pak)"; symbols[2] = "SCBPL";
            names[3] = "United Bank Limited"; symbols[3] = "UBL";
            names[4] = "Oil & Gas Development Co"; symbols[4] = "OGDC";
        }
        else if (index == 3) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Pakistan Petroleum Limited"; symbols[0] = "PPL";
            names[1] = "Mari Petroleum Company Ltd"; symbols[1] = "MARI";
            names[2] = "Pakistan Oilfields Limited"; symbols[2] = "POL";
            names[3] = "Pakistan State Oil Company"; symbols[3] = "PSO";
            names[4] = "Attock Petroleum Limited"; symbols[4] = "APL";
        }
        else if (index == 4) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Attock Refinery Limited"; symbols[0] = "ATRL";
            names[1] = "Cnergyico PK Limited"; symbols[1] = "CNERGY";
            names[2] = "Sui Northern Gas Pipelines"; symbols[2] = "SNGP";
            names[3] = "Sui Southern Gas Company"; symbols[3] = "SSGC";
            names[4] = "Engro Corporation Limited"; symbols[4] = "ENGRO";
        }
        else if (index == 5) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Engro Fertilizers Limited"; symbols[0] = "EFERT";
            names[1] = "Fauji Fertilizer Company"; symbols[1] = "FFC";
            names[2] = "Fatima Fertilizer Company"; symbols[2] = "FATIMA";
            names[3] = "Lucky Cement Limited"; symbols[3] = "LUCK";
            names[4] = "D.G. Khan Cement Co"; symbols[4] = "DGKC";
        }
        else if (index == 6) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Maple Leaf Cement Factory"; symbols[0] = "MLCF";
            names[1] = "Fauji Cement Company"; symbols[1] = "FCCL";
            names[2] = "Cherat Cement Company"; symbols[2] = "CHCC";
            names[3] = "Bestway Cement Limited"; symbols[3] = "BWCL";
            names[4] = "Kohat Cement Company"; symbols[4] = "KOHC";
        }
        else if (index == 7) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Pioneer Cement Limited"; symbols[0] = "PIOC";
            names[1] = "Power Cement Limited"; symbols[1] = "POWER";
            names[2] = "Thatta Cement Company"; symbols[2] = "THCCL";
            names[3] = "Systems Limited"; symbols[3] = "SYS";
            names[4] = "TRG Pakistan Limited"; symbols[4] = "TRG";
        }
        else if (index == 8) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Air Link Communication"; symbols[0] = "AIRLINK";
            names[1] = "Pakistan Telecommunication Co"; symbols[1] = "PTC";
            names[2] = "The Hub Power Company"; symbols[2] = "HUBC";
            names[3] = "K-Electric Limited"; symbols[3] = "KEL";
            names[4] = "Kot Addu Power Company"; symbols[4] = "KAPCO";
        }
        else if (index == 9) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Nishat Chunian Power Limited"; symbols[0] = "NCPL";
            names[1] = "Nishat Power Limited"; symbols[1] = "NPL";
            names[2] = "Abbott Laboratories (Pakistan)"; symbols[2] = "ABOT";
            names[3] = "GlaxoSmithKline Pakistan"; symbols[3] = "GLAXO";
            names[4] = "Haleon Pakistan Limited"; symbols[4] = "HALEON";
        }
        else if (index == 10) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "The Searle Company Limited"; symbols[0] = "SEARL";
            names[1] = "AGP Limited"; symbols[1] = "AGP";
            names[2] = "Citi Pharma Limited"; symbols[2] = "CPHL";
            names[3] = "Highnoon Laboratories"; symbols[3] = "HINOON";
            names[4] = "Shifa International Hospitals"; symbols[4] = "SHFA";
        }
        else if (index == 11) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Indus Motor Company"; symbols[0] = "INDU";
            names[1] = "Honda Atlas Cars (Pakistan)"; symbols[1] = "HCAR";
            names[2] = "Millat Tractors Limited"; symbols[2] = "MTL";
            names[3] = "Atlas Honda Limited"; symbols[3] = "ATLH";
            names[4] = "Sazgar Engineering Works"; symbols[4] = "SAZEW";
        }
        else if (index == 12) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Ghandhara Automobiles Ltd"; symbols[0] = "GAL";
            names[1] = "Ghandhara Industries Ltd"; symbols[1] = "GHNI";
            names[2] = "Thal Limited"; symbols[2] = "THALL";
            names[3] = "Service Industries Limited"; symbols[3] = "SRVI";
            names[4] = "Interloop Limited"; symbols[4] = "ILP";
        }
        else if (index == 13) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Nishat Mills Limited"; symbols[0] = "NML";
            names[1] = "Kohinoor Textile Mills"; symbols[1] = "KTML";
            names[2] = "Gadoon Textile Mills"; symbols[2] = "GADT";
            names[3] = "Ibrahim Fibres Limited"; symbols[3] = "IBFL";
            names[4] = "Image Pakistan Limited"; symbols[4] = "IMAGE";
        }
        else if (index == 14) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Bannu Woollen Mills Ltd"; symbols[0] = "BNWM";
            names[1] = "Yousaf Weaving Mills"; symbols[1] = "YOUW";
            names[2] = "Lucky Core Industries Ltd"; symbols[2] = "LCI";
            names[3] = "Lotte Chemical Pakistan"; symbols[3] = "LOTCHEM";
            names[4] = "Nestle Pakistan Limited"; symbols[4] = "NESTLE";
        }
        else if (index == 15) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Colgate-Palmolive (Pakistan)"; symbols[0] = "COLG";
            names[1] = "National Foods Limited"; symbols[1] = "NATF";
            names[2] = "Fauji Foods Limited"; symbols[2] = "FFL";
            names[3] = "Murree Brewery Company"; symbols[3] = "MUREB";
            names[4] = "Unilever Pakistan Foods"; symbols[4] = "UPFL";
        }
        else if (index == 16) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "SS Oil Mills Limited"; symbols[0] = "SSOM";
            names[1] = "Pakistan Tobacco Company"; symbols[1] = "PAKT";
            names[2] = "Adamjee Insurance Co"; symbols[2] = "AICL";
            names[3] = "Arif Habib Corporation"; symbols[3] = "AHCL";
            names[4] = "Pakistan Stock Exchange Ltd"; symbols[4] = "PSX";
        }
        else if (index == 17) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Dolmen City REIT"; symbols[0] = "DCR";
            names[1] = "TPL Properties REIT Fund"; symbols[1] = "TPLRF1";
            names[2] = "Javedan Corporation Ltd"; symbols[2] = "JVDC";
            names[3] = "First Habib Modaraba"; symbols[3] = "FHAM";
            names[4] = "Habib Metropolitan Modaraba"; symbols[4] = "HGFA";
        }
        else if (index == 18) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Pak Gulf Leasing Company"; symbols[0] = "PGLC";
            names[1] = "International Steels Ltd"; symbols[1] = "ISL";
            names[2] = "International Industries Ltd"; symbols[2] = "INIL";
            names[3] = "Pak Elektron Limited"; symbols[3] = "PAEL";
            names[4] = "Packages Limited"; symbols[4] = "PKGS";
        }
        else if (index == 19) {
            names = new string[](5);
            symbols = new string[](5);
            names[0] = "Tariq Glass Industries"; symbols[0] = "TGL";
            names[1] = "Ghani Glass Limited"; symbols[1] = "GHGL";
            names[2] = "JDW Sugar Mills Limited"; symbols[2] = "JDWS";
            names[3] = "Pak Intl Bulk Terminal"; symbols[3] = "PIBTL";
            names[4] = "Pakistan Services Limited"; symbols[4] = "PSEL";
        }
        else {
            revert("Invalid batch index");
        }
    }
}
