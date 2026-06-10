#Requires -Version 5.1
<#
.SYNOPSIS
    Provisions the RiskRadar Approved Tools Registry SharePoint list.

.DESCRIPTION
    Creates a SharePoint list with the full schema required by the RiskRadar MCP server
    (getAssessment, saveAssessment). Uses PnP PowerShell.

    Run this once per tenant before deploying the MCP server against SharePoint.

.PARAMETER SiteUrl
    Full URL of the SharePoint site (e.g. https://contoso.sharepoint.com/sites/IT).

.PARAMETER ListName
    Display name for the list. Defaults to "Approved Tools Registry".

.PARAMETER Force
    Skip the confirmation prompt.

.EXAMPLE
    .\provision-registry.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/IT"

.EXAMPLE
    .\provision-registry.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/IT" `
        -ListName "AI Tools Registry" -Force

.NOTES
    Prerequisites:
        Install-Module PnP.PowerShell -Scope CurrentUser
        (PnP.PowerShell 2.x requires PowerShell 7.2+; 1.x works on Windows PowerShell 5.1)

    After this script succeeds:
        1. Note the list URL printed at the end
        2. Set SP_SITE_URL and SP_LIST_NAME in your MCP server .env
        3. Register an Azure App Registration:
             - API permissions: Sites.ReadWrite.All (application, not delegated)
             - Grant admin consent
        4. Set SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET in your .env
        5. Switch server/src/store.ts to use graph-store.ts (see sharepoint/README.md)
#>

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory = $true, HelpMessage = 'Full URL of the SharePoint site')]
    [ValidatePattern('^https://[^/]+\.sharepoint\.com/')]
    [string]$SiteUrl,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ListName = 'Approved Tools Registry',

    [Parameter(Mandatory = $false)]
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ─── Helpers ──────────────────────────────────────────────────────────────────

function Add-TextField {
    param(
        [string]$List,
        [string]$DisplayName,
        [string]$InternalName,
        [bool]$Required = $false
    )
    $null = Add-PnPField -List $List `
        -DisplayName $DisplayName -InternalName $InternalName `
        -Type Text -AddToDefaultView
    if ($Required) {
        Set-PnPField -List $List -Identity $InternalName `
            -Values @{ Required = $true }
    }
    Write-Host "  + $DisplayName ($InternalName)" -ForegroundColor Gray
}

function Add-NumberField {
    param(
        [string]$List,
        [string]$DisplayName,
        [string]$InternalName,
        [double]$Min,
        [double]$Max
    )
    $null = Add-PnPField -List $List `
        -DisplayName $DisplayName -InternalName $InternalName `
        -Type Number -AddToDefaultView
    Set-PnPField -List $List -Identity $InternalName `
        -Values @{ MinimumValue = $Min; MaximumValue = $Max }
    Write-Host "  + $DisplayName ($InternalName) [$Min–$Max]" -ForegroundColor Gray
}

function Add-ChoiceField {
    param(
        [string]$List,
        [string]$DisplayName,
        [string]$InternalName,
        [string[]]$Choices
    )
    $null = Add-PnPField -List $List `
        -DisplayName $DisplayName -InternalName $InternalName `
        -Type Choice -Choices $Choices -AddToDefaultView
    Write-Host "  + $DisplayName ($InternalName) [$(($Choices -join ' | '))]" `
        -ForegroundColor Gray
}

# ─── Main ─────────────────────────────────────────────────────────────────────

Write-Host ''
Write-Host 'RiskRadar — Approved Tools Registry Provisioner' -ForegroundColor Cyan
Write-Host "Site:  $SiteUrl"
Write-Host "List:  $ListName"
Write-Host ''

if (-not $Force) {
    $confirm = Read-Host "Create the list '$ListName' on $SiteUrl? (y/N)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host 'Aborted.' -ForegroundColor Yellow
        exit 0
    }
}

Write-Host 'Connecting to SharePoint...' -NoNewline
Connect-PnPOnline -Url $SiteUrl -Interactive
Write-Host ' connected.' -ForegroundColor Green

# Guard: refuse to overwrite an existing list
$existing = Get-PnPList -Identity $ListName -ErrorAction SilentlyContinue
if ($null -ne $existing) {
    Write-Error "List '$ListName' already exists. Delete it first or choose a different -ListName."
    exit 1
}

Write-Host "Creating list '$ListName'..."
$null = New-PnPList -Title $ListName -Template GenericList -OnQuickLaunch -ErrorAction Stop

# Rename built-in Title column → Tool Name
Set-PnPField -List $ListName -Identity 'Title' -Values @{
    Title    = 'Tool Name'
    Required = $true
}
Write-Host '  ~ Title → Tool Name (required)' -ForegroundColor Gray

Write-Host 'Adding fields...'

# Vendor
Add-TextField -List $ListName -DisplayName 'Vendor Name' `
    -InternalName 'VendorName' -Required $true

# Assessment metadata
$null = Add-PnPField -List $ListName `
    -DisplayName 'Assessment Date' -InternalName 'AssessmentDate' `
    -Type DateTime -AddToDefaultView
Write-Host '  + Assessment Date (AssessmentDate)' -ForegroundColor Gray

# Composite risk score (sum of 5 dimension scores, 5–25)
Add-NumberField -List $ListName -DisplayName 'Risk Score (5–25)' `
    -InternalName 'RiskScore' -Min 5 -Max 25

# Five dimension scores (each 1–5)
Add-NumberField -List $ListName -DisplayName 'Data Privacy Score' `
    -InternalName 'DataPrivacyScore' -Min 1 -Max 5
Add-NumberField -List $ListName -DisplayName 'Age Appropriateness Score' `
    -InternalName 'AgeAppropScore' -Min 1 -Max 5
Add-NumberField -List $ListName -DisplayName 'Transparency Score' `
    -InternalName 'TransparencyScore' -Min 1 -Max 5
Add-NumberField -List $ListName -DisplayName 'Bias Risk Score' `
    -InternalName 'BiasScore' -Min 1 -Max 5
Add-NumberField -List $ListName -DisplayName 'Vendor Accountability Score' `
    -InternalName 'VendorAcctScore' -Min 1 -Max 5

# Ratings and decisions
Add-ChoiceField -List $ListName -DisplayName 'Risk Rating' `
    -InternalName 'RiskRating' `
    -Choices @('Low', 'Medium', 'High', 'Critical')

Add-ChoiceField -List $ListName -DisplayName 'Decision' `
    -InternalName 'Decision' `
    -Choices @(
        'Approved',
        'Approved with Controls',
        'Not Approved',
        'Escalate to DPO/DSL'       # DPO = Data Protection Officer, DSL = Designated Safeguarding Lead
    )

# Review scheduling
$null = Add-PnPField -List $ListName `
    -DisplayName 'Review Date' -InternalName 'ReviewDate' `
    -Type DateTime -AddToDefaultView
Write-Host '  + Review Date (ReviewDate)' -ForegroundColor Gray

# Assessed-by person
$null = Add-PnPField -List $ListName `
    -DisplayName 'Assessed By' -InternalName 'AssessedBy' `
    -Type User -AddToDefaultView
Write-Host '  + Assessed By (AssessedBy)' -ForegroundColor Gray

# Long-text fields
$null = Add-PnPField -List $ListName `
    -DisplayName 'AUP Clause' -InternalName 'AUPClause' `
    -Type Note -AddToDefaultView
Write-Host '  + AUP Clause (AUPClause)' -ForegroundColor Gray

$null = Add-PnPField -List $ListName `
    -DisplayName 'Notes' -InternalName 'Notes' `
    -Type Note -AddToDefaultView
Write-Host '  + Notes (Notes)' -ForegroundColor Gray

# Common Sense Media privacy grade (A/B/C/D/F from vendorLookup MCP tool)
Add-TextField -List $ListName -DisplayName 'CSM Privacy Rating' `
    -InternalName 'CSMRating'

# Re-assessment flag (set when vendor updates terms or incident reported)
$null = Add-PnPField -List $ListName `
    -DisplayName 'Reassessment Triggered' -InternalName 'ReassessmentTriggered' `
    -Type Boolean -AddToDefaultView
Write-Host '  + Reassessment Triggered (ReassessmentTriggered)' -ForegroundColor Gray

# ─── Summary ──────────────────────────────────────────────────────────────────

$listUrl = "$SiteUrl/Lists/$(($ListName -replace ' ', ''))"

Write-Host ''
Write-Host 'Approved Tools Registry provisioned.' -ForegroundColor Green
Write-Host "List URL: $listUrl"
Write-Host ''
Write-Host 'Next steps:' -ForegroundColor Cyan
Write-Host "  1. Set SP_SITE_URL=$SiteUrl in server/.env"
Write-Host "  2. Set SP_LIST_NAME=$ListName in server/.env"
Write-Host '  3. Create an Azure App Registration:'
Write-Host '       Azure Portal → App registrations → New registration'
Write-Host '       API permissions → Add → Microsoft Graph → Application → Sites.ReadWrite.All'
Write-Host '       Grant admin consent → Certificates & secrets → New client secret'
Write-Host "  4. Set SP_TENANT_ID, SP_CLIENT_ID, SP_CLIENT_SECRET in server/.env"
Write-Host '  5. In server/src/store.ts, swap the import to use graph-store.ts'
Write-Host '     (see riskradar/sharepoint/README.md for the one-line change)'
Write-Host ''
