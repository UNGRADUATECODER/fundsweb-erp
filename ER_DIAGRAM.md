erDiagram

&#x20;   USER ||--o{ QUOTATION : creates

&#x20;   USER ||--o{ SALES\_ORDER : creates



&#x20;   CUSTOMER ||--o{ CUSTOMER\_ENQUIRY : has

&#x20;   CUSTOMER ||--o{ SALES\_ORDER : places



&#x20;   CUSTOMER\_ENQUIRY ||--o{ ENQUIRY\_ITEM : contains

&#x20;   PRODUCT ||--o{ ENQUIRY\_ITEM : requested



&#x20;   CUSTOMER\_ENQUIRY ||--o{ QUOTATION : generates

&#x20;   QUOTATION ||--o{ QUOTATION\_ITEM : contains

&#x20;   PRODUCT ||--o{ QUOTATION\_ITEM : priced



&#x20;   QUOTATION ||--o| SALES\_ORDER : converts\_to

&#x20;   SALES\_ORDER ||--o{ SALES\_ORDER\_ITEM : contains

&#x20;   PRODUCT ||--o{ SALES\_ORDER\_ITEM : ordered



&#x20;   SALES\_ORDER ||--o{ DISPATCH : has

