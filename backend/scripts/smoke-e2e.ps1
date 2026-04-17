param(
  [string]$BaseUrl = "http://localhost:5000"
)

$ErrorActionPreference = "Stop"

function Invoke-Json {
  param(
    [Parameter(Mandatory=$true)][ValidateSet('GET','POST','PUT','PATCH','DELETE')][string]$Method,
    [Parameter(Mandatory=$true)][string]$Url,
    [object]$Body = $null,
    [string]$BearerToken = $null
  )

  $headers = @{}
  if ($BearerToken) {
    $headers["Authorization"] = "Bearer $BearerToken"
  }

  if ($null -ne $Body) {
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 10)
  }

  return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$pw = "Password123!"

$adminEmail = "superadmin$ts@test.com"
$memberApiEmail = "member_api$ts@test.com"
$memberAppEmail = "member_app$ts@test.com"

# Health check (best-effort)
try {
  Invoke-Json -Method GET -Url "$BaseUrl/api/health" | Out-Null
} catch {
  throw "Backend health check failed at $BaseUrl/api/health. Start the backend and try again. $($_.Exception.Message)"
}

# Register users
$adminReg = Invoke-Json -Method POST -Url "$BaseUrl/api/auth/register" -Body @{ name="Super Admin"; email=$adminEmail; password=$pw; role="SuperAdmin" }
$adminId = $adminReg.data.id

$memberApiReg = Invoke-Json -Method POST -Url "$BaseUrl/api/auth/register" -Body @{ name="Member API"; email=$memberApiEmail; password=$pw; role="Member" }
$memberApiId = $memberApiReg.data.id

$memberAppReg = Invoke-Json -Method POST -Url "$BaseUrl/api/auth/register" -Body @{ name="Member App"; email=$memberAppEmail; password=$pw; role="Member" }
$memberAppId = $memberAppReg.data.id

# Validate login endpoint and use login tokens (matches app behavior)
$adminLogin = Invoke-Json -Method POST -Url "$BaseUrl/api/auth/login" -Body @{ email=$adminEmail; password=$pw }
$adminToken = $adminLogin.data.token

$memberApiLogin = Invoke-Json -Method POST -Url "$BaseUrl/api/auth/login" -Body @{ email=$memberApiEmail; password=$pw }
$memberApiToken = $memberApiLogin.data.token

$memberAppLogin = Invoke-Json -Method POST -Url "$BaseUrl/api/auth/login" -Body @{ email=$memberAppEmail; password=$pw }

if ($adminLogin.data.id -ne $adminId) { throw "Admin login returned unexpected id" }
if ($memberApiLogin.data.id -ne $memberApiId) { throw "Member API login returned unexpected id" }
if ($memberAppLogin.data.id -ne $memberAppId) { throw "Member App login returned unexpected id" }

# Create club + event as admin
$clubName = "Smoke Club $ts"
$clubRes = Invoke-Json -Method POST -Url "$BaseUrl/api/clubs" -BearerToken $adminToken -Body @{ name=$clubName; description="Created by smoke test" }
$clubId = $clubRes.data.id

$eventTitle = "Smoke Event $ts"
$eventDate = ([DateTime]::UtcNow.AddDays(7)).ToString('o')
$eventRes = Invoke-Json -Method POST -Url "$BaseUrl/api/events" -BearerToken $adminToken -Body @{ club_id=$clubId; title=$eventTitle; description="Created by smoke test"; venue="Main Hall"; event_date=$eventDate }
$eventId = $eventRes.data.id

# Join club + RSVP event as memberApi
Invoke-Json -Method POST -Url "$BaseUrl/api/clubs/$clubId/join" -BearerToken $memberApiToken | Out-Null
Invoke-Json -Method POST -Url "$BaseUrl/api/events/$eventId/join" -BearerToken $memberApiToken | Out-Null

# Verify joined flags via list endpoints
$clubsList = Invoke-Json -Method GET -Url "$BaseUrl/api/clubs" -BearerToken $memberApiToken
$clubRow = $clubsList.data | Where-Object { $_.id -eq $clubId } | Select-Object -First 1

$eventsList = Invoke-Json -Method GET -Url "$BaseUrl/api/events" -BearerToken $memberApiToken
$eventRow = $eventsList.data | Where-Object { $_.id -eq $eventId } | Select-Object -First 1

# Verify attendance roster includes registered memberApi (pending if not marked)
$roster = Invoke-Json -Method GET -Url "$BaseUrl/api/attendance/event/$eventId" -BearerToken $adminToken
$rosterRow = $roster.data | Where-Object { $_.user_id -eq $memberApiId } | Select-Object -First 1

$clubJoined = if ($null -ne $clubRow) { [bool]$clubRow.joined } else { $false }
$eventJoined = if ($null -ne $eventRow) { [bool]$eventRow.joined } else { $false }
$memberCount = if ($null -ne $clubRow) { $clubRow.memberCount } else { $null }
$rosterHasMember = [bool]$rosterRow
$rosterStatus = if ($rosterRow) { $rosterRow.status } else { $null }

Write-Output "SMOKE_OK adminId=$adminId memberApiId=$memberApiId clubId=$clubId clubJoined=$clubJoined clubMemberCount=$memberCount eventId=$eventId eventJoined=$eventJoined rosterHasMember=$rosterHasMember rosterStatus=$rosterStatus"
Write-Output "LOGIN_OK adminRole=$($adminLogin.data.role) memberRole=$($memberAppLogin.data.role)"
Write-Output "APP_TEST_DATA clubName='$clubName' eventTitle='$eventTitle'"
Write-Output "APP_LOGIN email=$memberAppEmail password=$pw (use this in the app to test Join Club + Join Event)"
