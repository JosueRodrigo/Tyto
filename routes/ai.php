<?php

use App\Mcp\Servers\TytoServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp', TytoServer::class)->middleware(['auth:sanctum']);
